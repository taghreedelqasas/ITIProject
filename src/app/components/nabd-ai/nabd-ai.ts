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

    if (file) {
      const isImage = file.type.startsWith('image/');
      const request$ = isImage
        ? this.chatService.analyzeImage(file)
        : this.chatService.analyzePdf(file);

      request$.subscribe({
        next: (res) => {
          this.messages.update(msgs => [...msgs, { role: 'ai', text: res.explanation }]);
        },
        error: (err) => this.handleChatError(err)
      });
    } else {
      this.chatService.sendMessage(messageText).subscribe({
        next: (res) => {
          this.messages.update(msgs => [...msgs, { role: 'ai', text: res.reply }]);
        },
        error: (err) => this.handleChatError(err)
      });
    }
  }

  private handleChatError(err: any) {
    console.error('Chat API error:', err);
    this.messages.update(msgs => [...msgs, {
      role: 'ai',
      text: 'حدث خطأ أثناء الاتصال بالمساعد الذكي. حاول مرة أخرى.'
    }]);
  }

  startNewChat() {
    this.messages.set([]);
    this.selectedFile.set(null);
    this.selectedFilePreviewUrl.set(null);
  }
}
