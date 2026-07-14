import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConversationService } from '../../core/services/conversation.service';
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
  time: string;
  read?: boolean;
}

interface QuickAction {
  label: string;
}

const POLL_INTERVAL_MS = 6000;

@Component({
  selector: 'app-doctor-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-chat.html',
  styleUrl: './doctor-chat.css',
})
export class DoctorChat implements AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  doctorId: number | null = null;
  conversationId: number | null = null;
  isLoading = false;
  errorMessage = '';

  private pollHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private conversationService: ConversationService
  ) {
    const params = this.route.snapshot.queryParamMap;
    const doctorName = params.get('doctorName');
    if (doctorName) {
      this.doctor.name = doctorName;
      this.doctor.specialty = params.get('specialty') || this.doctor.specialty;
      this.doctor.image = params.get('image') || this.doctor.image;
    }

    const doctorIdParam = params.get('doctorId');
    this.doctorId = doctorIdParam ? Number(doctorIdParam) : null;

    const conversationIdParam = params.get('conversationId');
    this.conversationId = conversationIdParam ? Number(conversationIdParam) : null;
  }

  ngOnInit(): void {
    if (this.conversationId) {
      this.loadMessages(true);
    } else if (this.doctorId) {
      this.startOrResumeConversation(this.doctorId);
    }

    // بولينج بسيط لتحديث الرسائل بدل الاعتماد على WebSocket
    this.pollHandle = setInterval(() => {
      if (this.conversationId) this.loadMessages(false);
    }, POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.pollHandle) clearInterval(this.pollHandle);
  }

  private startOrResumeConversation(doctorId: number): void {
    this.isLoading = true;
    // نداء API: POST /api/Conversation/start/{doctorId}
    // (السيرفر بيرجع نفس المحادثة القائمة لو موجودة بالفعل بدل ما ينشئ واحدة جديدة)
    this.conversationService.startAsPatient(doctorId).subscribe({
      next: (conversation) => {
        this.conversationId = (conversation?.id as number) ?? null;
        this.isLoading = false;
        if (this.conversationId) {
          this.loadMessages(true);
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'تعذر فتح المحادثة مع الطبيب.';
      },
    });
  }

  private mapMessage(m: ApiChatMessage): ChatMessage {
    const isMine = m.senderType === 'Patient';
    let time = '';
    if (m.sentAt) {
      try {
        time = new Date(m.sentAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      } catch {
        time = '';
      }
    }
    return {
      sender: isMine ? 'patient' : 'doctor',
      type: 'text',
      text: m.content,
      time,
      read: m.isRead,
    };
  }

  private loadMessages(showLoading: boolean): void {
    if (!this.conversationId) return;
    if (showLoading) this.isLoading = true;

    // نداء API: GET /api/Conversation/{conversationId}/messages
    this.conversationService.getMessages(this.conversationId).subscribe({
      next: (msgs) => {
        this.messages = (msgs || []).map((m) => this.mapMessage(m));
        this.isLoading = false;

        // نداء API: PUT /api/Conversation/{conversationId}/read لتعليم الرسائل كمقروءة
        if (this.conversationId) {
          this.conversationService.markAsRead(this.conversationId).subscribe({ error: () => {} });
        }
      },
      error: () => {
        this.isLoading = false;
        if (showLoading) this.errorMessage = 'تعذر تحميل الرسائل.';
      },
    });
  }

  // ================== بيانات الطبيب ==================
  doctor = {
    name: 'د. سارة إبراهيم',
    specialty: 'إستشارية جراحة العظام',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&q=80',
    isOnline: true,
  };

  optionsMenuOpen = false;

  // ================== الرسائل ==================
  todayLabel = 'اليوم';

  messages: ChatMessage[] = [];

  isDoctorTyping = false;

  quickActions: QuickAction[] = [
    { label: 'حجز موعد' },
    { label: 'إرسال تقرير' },
    { label: 'مشاركة نتائج التحاليل' },
  ];

  messageText = '';

  pendingFileAction: 'report' | 'results' | 'attachment' | 'image' | null = null;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {
      /* تجاهل أي خطأ في السكرول */
    }
  }

  private currentTime(): string {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  }

  toggleOptionsMenu(): void {
    this.optionsMenuOpen = !this.optionsMenuOpen;
  }

  onViewDoctorProfile(): void {
    this.optionsMenuOpen = false;
    this.router.navigate(['/doctor', this.doctorId ?? 1]);
  }

  onCloseChat(): void {
    this.optionsMenuOpen = false;
    this.location.back();
  }

  onSend(): void {
    const trimmed = this.messageText.trim();
    if (!trimmed || !this.conversationId) return;

    const optimisticMessage: ChatMessage = {
      sender: 'patient',
      type: 'text',
      text: trimmed,
      time: this.currentTime(),
      read: true,
    };
    this.messages.push(optimisticMessage);
    this.messageText = '';

    // نداء API: POST /api/Conversation/{conversationId}/messages
    this.conversationService.sendMessage(this.conversationId, { content: trimmed }).subscribe({
      error: () => {
        this.errorMessage = 'تعذر إرسال الرسالة.';
      },
    });
  }

  onQuickAction(action: QuickAction): void {
    if (action.label === 'حجز موعد') {
      this.router.navigate(['/booking'], {
        queryParams: {
          doctorId: this.doctorId,
          rebookDoctorName: this.doctor.name,
          rebookSpecialty: this.doctor.specialty,
          rebookImage: this.doctor.image,
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

    const sizeKb = file.size / 1024;
    const sizeLabel = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb.toFixed(0)} KB`;

    let note = 'مرفق ملف.';
    if (this.pendingFileAction === 'report') note = 'مرفق التقرير الطبي المطلوب.';
    if (this.pendingFileAction === 'results') note = 'مرفق نتائج التحاليل.';

    // ملحوظة: الـ API الحالي لا يدعم إرفاق ملفات داخل رسائل الشات مباشرة،
    // فبنعرض الملف في واجهة المحادثة فقط، ولو حابب ترفعه فعليًا استخدم تاب "الملف الطبي".
    this.messages.push({
      sender: 'patient',
      type: 'file',
      fileName: file.name,
      fileSize: sizeLabel,
      fileNote: note,
      time: this.currentTime(),
      read: true,
    });

    input.value = '';
    this.pendingFileAction = null;
  }
}
