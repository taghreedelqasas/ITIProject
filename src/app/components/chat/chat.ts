import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit, OnDestroy, Input, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConversationService } from '../../core/services/conversation.service';
import { AuthService } from '../../core/services/auth.service';
import { SignalRService } from '../../core/services/signalr.service';
import { ChatMessage as ApiChatMessage } from '../../core/models/conversation.model';

type SenderType = 'doctor' | 'patient';
type MessageType = 'text' | 'file';

interface ChatMessage {
  sender: SenderType;
  type: MessageType;
  text?: string;
  fileName?: string;
  fileSize?: string;
  fileNote?: string;
  fileUrl?: string;
  isImage?: boolean;
  isAudio?: boolean;
  isPlaying?: boolean;
  audioProgress?: number;
  time: string;
  read?: boolean;
}

interface QuickAction {
  label: string;
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent implements AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  @Input() conversationId: number | null = null;
  @Input() doctorId: number | null = null;
  @Input() patientId: string | null = null;

  isDoctor = false;
  isLoading = signal(false);
  errorMessage = signal('');

  private signalr = inject(SignalRService);
  private subscriptions: Subscription[] = [];
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private isSendingTyping = false;
  quickActions: QuickAction[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private conversationService: ConversationService,
    private authService: AuthService 
  ) {
    const roles = this.authService.getUserRoles() || [];

    console.log('المستخدم لديه الرتب التالية:', roles);
    const localDoctorId = this.authService.getDoctorId(); 
    this.isDoctor = !!localDoctorId;
      
    console.log('هل تم تحديد المستخدم كطبيب؟', this.isDoctor);

    if (!this.isDoctor) {
      this.quickActions = [
        { label: 'حجز موعد' },
        { label: 'إرسال تقرير' },
        { label: 'مشاركة نتائج التحاليل' },
      ];
    } else {
      this.quickActions = []; 
    }

    const params = this.route.snapshot.queryParamMap;

    if (!this.conversationId) {
      const cid = params.get('conversationId');
      this.conversationId = cid ? Number(cid) : null;
    }
    if (!this.doctorId) {
      const did = params.get('doctorId');
      this.doctorId = did ? Number(did) : null;
    }
    if (!this.patientId) {
      this.patientId = params.get('patientId');
    }

    const name = params.get('name');
    const specialty = params.get('specialty');
    
    // 🎯 التقاط الرابط وفك الترميز (Decoding) لحل مشكلة الرموز المشوهة مثل %2F
    const rawImage = params.get('image') || params.get('patientImage') || params.get('imagePatient') || params.get('avatar');
    const image = rawImage ? decodeURIComponent(rawImage) : null;

    if (this.isDoctor) {
      if (name) this.otherParty.name = name;
      if (image) this.otherParty.image = image;
    } else {
      if (name) this.doctorInfo.name = name;
      if (specialty) this.doctorInfo.specialty = specialty;
      if (image) this.doctorInfo.image = image;
    }

    // 🔍 طباعة القيم في الـ Console للتأكد والتشخيص
    console.log('--- فحص رابط الصورة قيد التحميل ---');
    console.log('1. الرابط بعد فك الترميز مباشرة:', image);
    console.log('2. القيمة المعتمدة للمريض (otherParty):', this.otherParty.image);
    console.log('3. القيمة المعتمدة للطبيب (doctorInfo):', this.doctorInfo.image);
    console.log('------------------------------------');
  }

  ngOnInit(): void {
    this.signalr.startConnection().then(() => {
      if (this.conversationId) {
        this.signalr.joinConversation(this.conversationId);
      }
    });

    this.subscriptions.push(
      this.signalr.messageReceived$.subscribe((msg) => {
        if (msg.conversationId && msg.conversationId !== this.conversationId) return;
        const isMyMessage = this.isMessageMine(msg);
        if (isMyMessage) return;

        const mapped = this.mapMessage(msg);
        this.messages.update((prev) => [...prev, mapped]);
        if (this.conversationId) {
          this.signalr.sendMarkAsRead(this.conversationId);
        }
      }),
      this.signalr.userTyping$.subscribe(({ conversationId }) => {
        if (conversationId !== this.conversationId) return;
        this.isTyping.set(true);
      }),
      this.signalr.userStoppedTyping$.subscribe(({ conversationId }) => {
        if (conversationId !== this.conversationId) return;
        this.isTyping.set(false);
      }),
      this.signalr.messagesRead$.subscribe(({ conversationId }) => {
        if (conversationId !== this.conversationId) return;
        this.messages.update((prev) => prev.map(m => ({ ...m, read: true })));
      })
    );

    if (this.conversationId) {
      this.loadMessages(true);
    } else if (this.isDoctor && this.patientId) {
      this.startAsDoctor(this.patientId);
    } else if (!this.isDoctor && this.doctorId) {
      this.startAsPatient(this.doctorId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    if (this.conversationId) {
      this.signalr.sendStopTyping(this.conversationId);
    }
    if (this.isRecording()) {
      this.stopRecording();
    }
    if (this.pendingFilePreviewUrl) {
      URL.revokeObjectURL(this.pendingFilePreviewUrl);
    }
  }

  doctorInfo = {
    name: 'د. سارة إبراهيم',
    specialty: 'إستشارية جراحة العظام',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&q=80',
    isOnline: true,
  };

  otherParty = {
    name: 'مريض',
    image: '',
  };

  optionsMenuOpen = false;
  todayLabel = 'اليوم';
  messages = signal<ChatMessage[]>([]);
  isTyping = signal(false);
  messageText = '';
  
  pendingFileAction: 'report' | 'results' | 'attachment' | 'image' | null = null;

  // مرفق تم اختياره لكن لسه متبعتش - بينتظر ضغطة زرار الإرسال
  pendingFile: File | null = null;
  pendingFilePreviewUrl: string | null = null;
  pendingFileIsImage = false;

  isRecording = signal(false);
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch { /* ignore */ }
  }

  private currentTime(): string {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  }

  private startAsPatient(doctorId: number): void {
    this.isLoading.set(true);
    this.conversationService.startAsPatient(doctorId).subscribe({
      next: (conversation) => {
        this.conversationId = (conversation?.id as number) ?? null;
        this.isLoading.set(false);
        if (this.conversationId) {
          this.loadMessages(true);
          this.signalr.joinConversation(this.conversationId);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('تعذر فتح المحادثة مع الطبيب.');
      },
    });
  }

  private startAsDoctor(patientId: string): void {
    this.isLoading.set(true);
    this.conversationService.startAsDoctor(patientId).subscribe({
      next: (conversation: any) => {
        this.conversationId = (conversation?.id as number) ?? null;
        this.isLoading.set(false);
        
        if (conversation?.patientImage && !this.otherParty.image) {
          this.otherParty.image = conversation.patientImage;
        }

        if (this.conversationId) {
          this.loadMessages(true);
          this.signalr.joinConversation(this.conversationId);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('تعذر فتح المحادثة مع المريض.');
      },
    });
  }

  private isMessageMine(m: ApiChatMessage): boolean {
    return m.senderUserId === this.signalr.currentUserId;
  }

  private mapMessage(m: ApiChatMessage): ChatMessage {
    const isMyMessage = this.isMessageMine(m);
    let time = '';
    const dateStr = m.createdAt;
    if (dateStr) {
      try {
        // الباك إند بيبعت الوقت بتوقيت UTC (DateTime.UtcNow) بس من غير علامة "Z" في الآخر،
        // فالمتصفح كان بيفتكره توقيت محلي ومبيحولوش، فالوقت الظاهر كان بيبقى غلط.
        // هنا بنضيف "Z" يدويًا عشان نجبر المتصفح يتعامل معاه كـ UTC ويحوّله صح للتوقيت المحلي.
        const utcDateStr = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
        time = new Date(utcDateStr).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      } catch { time = ''; }
    }

    // رسائل المرفقات: الحقول دي مطابقة لـ MessageDto فعلياً
    // (AttachmentUrl / AttachmentName / AttachmentType في الباك إند بيترجموا camelCase هنا)
    // AttachmentUrl راجع بالفعل رابط كامل من ImageUrlHelper.ToFullUrl، مفيش داعي نضيف الدومين تاني
    const anyMsg = m as any;
    const attachmentUrl: string | undefined = anyMsg.attachmentUrl;

    if (attachmentUrl) {
      const fileName: string = anyMsg.attachmentName || 'ملف';
      const attachmentType: string = anyMsg.attachmentType || '';
      const isImage = attachmentType.startsWith('image/');
      const isAudio = attachmentType.startsWith('audio/');

      return {
        sender: isMyMessage ? (this.isDoctor ? 'doctor' : 'patient') : (this.isDoctor ? 'patient' : 'doctor'),
        type: 'file',
        fileName,
        fileSize: '',
        fileNote: m.content || (isImage ? 'صورة مرفقة.' : isAudio ? 'رسالة صوتية.' : 'مرفق ملف.'),
        fileUrl: attachmentUrl,
        isImage,
        isAudio,
        time,
        read: m.isRead,
      };
    }

    return {
      sender: isMyMessage ? (this.isDoctor ? 'doctor' : 'patient') : (this.isDoctor ? 'patient' : 'doctor'),
      type: 'text',
      text: m.content,
      time,
      read: m.isRead,
    };
  }

  private loadMessages(showLoading: boolean): void {
    if (!this.conversationId) return;
    if (showLoading) this.isLoading.set(true);

    this.conversationService.getMessages(this.conversationId).subscribe({
      next: (msgs) => {
        this.messages.set((msgs || []).map((m) => this.mapMessage(m)));
        this.isLoading.set(false);
        if (this.conversationId) {
          this.signalr.sendMarkAsRead(this.conversationId);
        }
      },
      error: () => {
        this.isLoading.set(false);
        if (showLoading) this.errorMessage.set('تعذر تحميل الرسائل.');
      },
    });
  }

  toggleOptionsMenu(): void {
    this.optionsMenuOpen = !this.optionsMenuOpen;
  }

  onViewProfile(): void {
    this.optionsMenuOpen = false;
    if (this.isDoctor) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/doctor', this.doctorId ?? 1]);
    }
  }

  onCloseChat(): void {
    this.optionsMenuOpen = false;
    this.location.back();
  }

  onSend(): void {
    const trimmed = this.messageText.trim();
    if (!trimmed && !this.pendingFile) return;

    if (!this.conversationId) {
      this.errorMessage.set('المحادثة لم تبدأ بعد. جاري المحاولة...');
      if (!this.isDoctor && this.doctorId) {
        this.startAsPatient(this.doctorId);
      } else if (this.isDoctor && this.patientId) {
        this.startAsDoctor(this.patientId);
      }
      return;
    }

    // فيه مرفق مستني الإرسال (صورة/ملف) - يتبعت هنا فقط لما تدوسي زرار الإرسال
    if (this.pendingFile) {
      let caption = trimmed;
      if (!caption) {
        if (this.pendingFileAction === 'report') caption = 'مرفق التقرير الطبي المطلوب.';
        else if (this.pendingFileAction === 'results') caption = 'مرفق نتائج التحاليل.';
        else if (this.pendingFileAction === 'image') caption = 'صورة مرفقة.';
        else caption = 'مرفق ملف.';
      }
      const fileToSend = this.pendingFile;
      this.cancelPendingFile();
      this.messageText = '';
      this.sendFileMessage(fileToSend, caption);
      return;
    }

    const sender: SenderType = this.isDoctor ? 'doctor' : 'patient';
    const optimisticMessage: ChatMessage = {
      sender,
      type: 'text',
      text: trimmed,
      time: this.currentTime(),
      read: true,
    };
    this.messages.update((prev) => [...prev, optimisticMessage]);
    this.messageText = '';

    this.signalr.sendStopTyping(this.conversationId);

    this.conversationService.sendMessage(this.conversationId, { content: trimmed }).subscribe({
      error: () => {
        this.errorMessage.set('تعذر إرسال الرسالة.');
      },
    });
  }

  cancelPendingFile(): void {
    if (this.pendingFilePreviewUrl) {
      URL.revokeObjectURL(this.pendingFilePreviewUrl);
    }
    this.pendingFile = null;
    this.pendingFilePreviewUrl = null;
    this.pendingFileIsImage = false;
    this.pendingFileAction = null;
  }

  // مشغل الصوت المخصص لرسائل الفويس (بدل الـ controls الافتراضية للمتصفح)
  toggleAudioPlay(msg: ChatMessage, audioEl: HTMLAudioElement): void {
    if (audioEl.paused) {
      audioEl.play();
      msg.isPlaying = true;
    } else {
      audioEl.pause();
      msg.isPlaying = false;
    }
  }

  onAudioEnded(msg: ChatMessage): void {
    msg.isPlaying = false;
    msg.audioProgress = 0;
  }

  onAudioTimeUpdate(msg: ChatMessage, audioEl: HTMLAudioElement): void {
    if (audioEl.duration) {
      msg.audioProgress = (audioEl.currentTime / audioEl.duration) * 100;
    }
  }

  onTyping(): void {
    if (!this.conversationId || this.isSendingTyping) return;
    this.isSendingTyping = true;
    this.signalr.sendTyping(this.conversationId);

    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.signalr.sendStopTyping(this.conversationId!);
      this.isSendingTyping = false;
    }, 2000);
  }

  onQuickAction(action: QuickAction): void {
    if (action.label === 'حجز موعد') {
      this.router.navigate(['/booking'], {
        queryParams: {
          doctorId: this.doctorId,
          rebookDoctorName: this.doctorInfo.name,
          rebookSpecialty: this.doctorInfo.specialty,
          rebookImage: this.doctorInfo.image,
        },
      });
      return;
    }

    if (action.label === 'إرسال تقرير') {
      this.pendingFileAction = 'report';
      this.fileInput?.nativeElement.click();
      return;
    }

    if (action.label === 'مشاركة نتائج التحاليل') {
      this.pendingFileAction = 'results';
      this.fileInput?.nativeElement.click();
      return;
    }
  }

  triggerAttachment(): void {
    this.pendingFileAction = 'attachment';
    this.fileInput?.nativeElement.click();
  }

  triggerImage(): void {
    this.pendingFileAction = 'image';
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    // لو فيه مرفق قديم مستني، امسحيه الأول قبل ما تحطي الجديد
    if (this.pendingFilePreviewUrl) {
      URL.revokeObjectURL(this.pendingFilePreviewUrl);
    }

    this.pendingFile = file;
    this.pendingFileIsImage = file.type.startsWith('image/');
    this.pendingFilePreviewUrl = URL.createObjectURL(file);

    input.value = '';
  }
  // مسار مشترك لإرسال أي مرفق (ملف / صورة / تسجيل صوتي) بنفس المنطق:
  // معاينة محلية فورية + رفع للسيرفر + استبدال الرابط المحلي بالرابط الدائم
  private sendFileMessage(file: File, caption: string): void {
    const sender: SenderType = this.isDoctor ? 'doctor' : 'patient';
    const sizeKb = file.size / 1024;
    const sizeLabel = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb.toFixed(0)} KB`;

    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    const localPreviewUrl = URL.createObjectURL(file);

    this.messages.update((prev) => [
      ...prev,
      {
        sender,
        type: 'file',
        fileName: file.name,
        fileSize: sizeLabel,
        fileNote: caption,
        fileUrl: localPreviewUrl,
        isImage,
        isAudio,
        time: this.currentTime(),
        read: true,
      }
    ]);

    if (this.conversationId) {
      this.conversationService.uploadAttachment(this.conversationId, file, caption).subscribe({
        next: (res: any) => {
          // uploadAttachment بيرجع MessageDto فيه attachmentUrl كرابط كامل جاهز
          const realUrl = res?.attachmentUrl;
          if (realUrl) {
            this.messages.update((prev) =>
              prev.map((msg) => (msg.fileUrl === localPreviewUrl ? { ...msg, fileUrl: realUrl } : msg))
            );
          }
        },
        error: () => {
          this.errorMessage.set('تعذر رفع المرفق.');
        },
      });
    }
  }

  toggleVoiceRecording(): void {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  private async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        // نقفل مايك المتصفح بعد ما نخلص تسجيل
        stream.getTracks().forEach((track) => track.stop());

        if (this.audioChunks.length === 0) return;

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `رسالة-صوتية-${Date.now()}.webm`, { type: 'audio/webm' });
        this.sendFileMessage(audioFile, 'رسالة صوتية.');
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
    } catch {
      this.errorMessage.set('تعذر الوصول للمايك. تأكدي من إعطاء إذن استخدام الميكروفون للمتصفح.');
    }
  }
// --------
  private stopRecording(): void {
    this.mediaRecorder?.stop();
    this.isRecording.set(false);
  }
}