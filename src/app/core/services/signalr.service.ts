import { Injectable, inject, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ChatMessage } from '../models/conversation.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private readonly authService = inject(AuthService);
  private readonly ngZone = inject(NgZone);
  private readonly hubUrl = `${environment.apiBaseUrl}/hubs/chat`;

  private hubConnection: signalR.HubConnection | null = null;
  private currentConversationId: number | null = null;

  messageReceived$ = new Subject<ChatMessage>();
  userTyping$ = new Subject<{ conversationId: number; userId: string }>();
  userStoppedTyping$ = new Subject<{ conversationId: number; userId: string }>();
  messagesRead$ = new Subject<{ conversationId: number; userId: string }>();

  async startConnection(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) return;

    const token = this.authService.getAccessToken();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
  console.log('📩 ReceiveMessage:', message);

  this.ngZone.run(() => {
    this.messageReceived$.next(message);
  });
});
    this.hubConnection.on('UserTyping', (conversationId: number, userId: string) => {
      this.ngZone.run(() => {
        this.userTyping$.next({ conversationId, userId });
      });
    });

    this.hubConnection.on('UserStoppedTyping', (conversationId: number, userId: string) => {
      this.ngZone.run(() => {
        this.userStoppedTyping$.next({ conversationId, userId });
      });
    });

    this.hubConnection.on('MessagesRead', (conversationId: number, userId: string) => {
      this.ngZone.run(() => {
        this.messagesRead$.next({ conversationId, userId });
      });
    });

    this.hubConnection.onreconnected(() => {
      this.ngZone.run(() => {
        if (this.currentConversationId) {
          this.joinConversation(this.currentConversationId);
        }
      });
    });

    try {
      await this.hubConnection.start();
      console.log('⚡ Connected to SignalR Hub successfully!');
    } catch (err) {
      console.error('❌ SignalR Hub Connection failed:', err);
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  async joinConversation(conversationId: number): Promise<void> {
    this.currentConversationId = conversationId;
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('JoinConversation', conversationId);
      } catch { /* HTTP fallback */ }
    }
  }

  async sendMessage(conversationId: number, content: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('SendMessage', conversationId, content);
      } catch { /* HTTP fallback */ }
    }
  }

  async sendTyping(conversationId: number): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('UserStartedTyping', conversationId);
      } catch { /* silent */ }
    }
  }

  async sendStopTyping(conversationId: number): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('UserStoppedTyping', conversationId);
      } catch { /* silent */ }
    }
  }

  async sendMarkAsRead(conversationId: number): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('MarkAsRead', conversationId);
      } catch { /* silent */ }
    }
  }

  get currentUserId(): string {
    const user = this.authService.getCurrentUser();
    return user?.sub || user?.nameid || user?.id || '';
  }

  get connectionState(): signalR.HubConnectionState {
    return this.hubConnection?.state ?? signalR.HubConnectionState.Disconnected;
  }
}