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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private conversationService: ConversationService,
    private authService: AuthService
  ) {
    this.isDoctor = this.authService.getUserRoles().some(r => r.toLowerCase() === 'doctor');

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
    const image = params.get('image');

    if (this.isDoctor) {
      if (name) this.otherParty.name = name;
      if (image) this.otherParty.image = image;
    } else {
      if (name) this.doctorInfo.name = name;
      if (specialty) this.doctorInfo.specialty = specialty;
      if (image) this.doctorInfo.image = image;
    }
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

  quickActions: QuickAction[] = this.isDoctor ? [] : [
    { label: 'حجز موعد' },
    { label: 'إرسال تقرير' },
    { label: 'مشاركة نتائج التحاليل' },
  ];

  pendingFileAction: 'report' | 'results' | 'attachment' | 'image' | null = null;

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
        time = new Date(dateStr).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      } catch { time = ''; }
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
    if (!trimmed) return;
    if (!this.conversationId) {
      this.errorMessage.set('المحادثة لم تبدأ بعد. جاري المحاولة...');
      if (!this.isDoctor && this.doctorId) {
        this.startAsPatient(this.doctorId);
      } else if (this.isDoctor && this.patientId) {
        this.startAsDoctor(this.patientId);
      }
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

    const sender: SenderType = this.isDoctor ? 'doctor' : 'patient';
    const sizeKb = file.size / 1024;
    const sizeLabel = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb.toFixed(0)} KB`;

    let caption = 'مرفق ملف.';
    if (this.pendingFileAction === 'report') caption = 'مرفق التقرير الطبي المطلوب.';
    if (this.pendingFileAction === 'results') caption = 'مرفق نتائج التحاليل.';
    if (this.pendingFileAction === 'image') caption = 'صورة مرفقة.';

    this.messages.update((prev) => [
      ...prev,
      {
        sender,
        type: 'file',
        fileName: file.name,
        fileSize: sizeLabel,
        fileNote: caption,
        time: this.currentTime(),
        read: true,
      }
    ]);

    if (this.conversationId) {
      this.conversationService.uploadAttachment(this.conversationId, file, caption).subscribe({
        error: () => {
          this.errorMessage.set('تعذر رفع المرفق.');
        },
      });
    }

    input.value = '';
    this.pendingFileAction = null;
  }
}
