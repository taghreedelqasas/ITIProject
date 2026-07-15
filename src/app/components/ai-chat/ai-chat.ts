import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import { AiChatService, AiChatMessage } from '../../core/services/ai-chat.service';

@Component({
  selector: 'app-ai-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.css',
})
export class AiChat implements OnInit, AfterViewChecked {
  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;
  @ViewChild('pdfInput') private pdfInput?: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput') private imageInput?: ElementRef<HTMLInputElement>;

  private aiChatService = inject(AiChatService);
  private sanitizer = inject(DomSanitizer);

  messageText = '';
  messages: AiChatMessage[] = [];
  isLoading = false;
  isSidebarOpen = true;
  chatHistory: any[] = [];
  errorMessage = '';

  ngOnInit(): void {
    this.loadHistory();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  loadHistory(): void {
    this.aiChatService.getHistory().subscribe({
      next: (history) => {
        this.chatHistory = history || [];
      },
      error: () => {},
    });
  }

  sendMessage(): void {
    const trimmed = this.messageText.trim();
    if (!trimmed || this.isLoading) return;

    this.messages.push({ role: 'user', content: trimmed });
    this.messageText = '';
    this.isLoading = true;
    this.errorMessage = '';

    this.aiChatService.sendMessage(trimmed).subscribe({
      next: (response) => {
        // console.log(response.reply);
        // let response = data.replay;
        // const reply =
        //   typeof response === 'string'
        //     ? response
        //     : response?.response ||
        //       response?.message ||
        //       response?.content ||
        //       JSON.stringify(response);

        const reply = response.reply;
        this.messages.push({ role: 'assistant', content: reply });
        this.isLoading = false;
        this.loadHistory();
      },
      error: () => {
        this.errorMessage = 'تعذر إرسال الرسالة. حاول مرة أخرى.';
        this.isLoading = false;
      },
    });
  }

  uploadPdf(): void {
    this.pdfInput?.nativeElement.click();
  }

  uploadImage(): void {
    this.imageInput?.nativeElement.click();
  }

  onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.messages.push({ role: 'user', content: `مرفق ملف: ${file.name}` });
    this.isLoading = true;
    this.errorMessage = '';

    this.aiChatService.analyzePdf(file).subscribe({
      next: (response) => {
        const reply =
          typeof response === 'string'
            ? response
            : response?.response ||
              response?.result ||
              response?.message ||
              JSON.stringify(response);
        this.messages.push({ role: 'assistant', content: reply });
        this.isLoading = false;
        this.loadHistory();
      },
      error: () => {
        this.errorMessage = 'تعذر تحليل الملف. حاول مرة أخرى.';
        this.isLoading = false;
      },
    });

    input.value = '';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.messages.push({ role: 'user', content: `مرفق صورة: ${file.name}` });
    this.isLoading = true;
    this.errorMessage = '';

    this.aiChatService.analyzeImage(file).subscribe({
      next: (response) => {
        const reply =
          typeof response === 'string'
            ? response
            : response?.response ||
              response?.result ||
              response?.message ||
              JSON.stringify(response);
        this.messages.push({ role: 'assistant', content: reply });
        this.isLoading = false;
        this.loadHistory();
      },
      error: () => {
        this.errorMessage = 'تعذر تحليل الصورة. حاول مرة أخرى.';
        this.isLoading = false;
      },
    });

    input.value = '';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  startNewChat(): void {
    this.messages = [];
    this.errorMessage = '';
  }

  renderMarkdown(text: string): SafeHtml {
    const html = marked.parse(text, { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
