import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chat } from '../../services/chat';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  specialties?: string[];
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentIsImage?: boolean;
}

interface SidebarChat {
  title: string;
}

@Component({
  selector: 'app-nabd-ai',
  imports: [CommonModule, FormsModule],
  templateUrl: './nabd-ai.html',
  styleUrl: './nabd-ai.css'
})
export class NabdAi {
  inputText = signal('');
  messages = signal<ChatMessage[]>([]);
  selectedFile = signal<File | null>(null);
  selectedFilePreviewUrl = signal<string | null>(null);
  isLoading = signal(false);

  suggestedQuestions = [
    'أعاني من صداع مستمر منذ يومين مع زغللة في العين',
    'أشعر بألم حاد في المعدة بعد تناول الطعام',
    'ما التخصص المناسب لألم أسفل الظهر؟',
    'ابحث لي عن أفضل طبيب قلب في الرياض'
  ];

  previousChats: SidebarChat[] = [
    { title: 'اسم المحادثة' },
    { title: 'اسم المحادثة' },
    { title: 'اسم المحادثة' },
    { title: 'اسم المحادثة' }
  ];

  constructor(private chatService: Chat) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      if (file.type.startsWith('image/')) {
        this.selectedFilePreviewUrl.set(URL.createObjectURL(file));
      } else {
        this.selectedFilePreviewUrl.set(null);
      }
    }
    input.value = '';
  }

  removeSelectedFile() {
    this.selectedFile.set(null);
    this.selectedFilePreviewUrl.set(null);
  }

  sendMessage(text?: string) {
    if (this.isLoading()) return; // prevent double-send while a request is in flight

    const messageText = (text ?? this.inputText()).trim();
    const file = this.selectedFile();

    if (!messageText && !file) return;

    const newMessage: ChatMessage = { role: 'user', text: messageText };

    if (file) {
      const isImage = file.type.startsWith('image/');
      newMessage.attachmentName = file.name;
      newMessage.attachmentIsImage = isImage;
      newMessage.attachmentUrl = isImage
        ? (this.selectedFilePreviewUrl() ?? URL.createObjectURL(file))
        : undefined;
    }

    this.messages.update(msgs => [...msgs, newMessage]);
    this.inputText.set('');
    this.selectedFile.set(null);
    this.selectedFilePreviewUrl.set(null);
    this.isLoading.set(true);

    if (file) {
      const isImage = file.type.startsWith('image/');
      const request$ = isImage
        ? this.chatService.analyzeImage(file)
        : this.chatService.analyzePdf(file);

      request$.subscribe({
        next: (res) => {
          this.messages.update(msgs => [...msgs, { role: 'ai', text: res.explanation }]);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.handleChatError(err);
          this.isLoading.set(false);
        }
      });
    } else {
      this.chatService.sendMessage(messageText).subscribe({
        next: (res) => {
          this.messages.update(msgs => [...msgs, { role: 'ai', text: res.reply }]);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.handleChatError(err);
          this.isLoading.set(false);
        }
      });
    }
  }

  private handleChatError(err: any) {
    console.error('Chat API error:', err);

    let errorText = 'حدث خطأ أثناء الاتصال بالمساعد الذكي. حاول مرة أخرى.';
    if (err?.status === 429) {
      errorText = 'الخدمة مشغولة حالياً، برجاء الانتظار قليلاً ثم المحاولة مرة أخرى.';
    }

    this.messages.update(msgs => [...msgs, {
      role: 'ai',
      text: errorText
    }]);
  }

  startNewChat() {
    this.messages.set([]);
    this.selectedFile.set(null);
    this.selectedFilePreviewUrl.set(null);
  }
}
