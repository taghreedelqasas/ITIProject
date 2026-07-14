import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatMessage, Conversation, SendMessageDto } from '../models/conversation.model';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Conversation`;

  constructor(private http: HttpClient) {}

  // المريض بيبدأ محادثة مع طبيب
  startAsPatient(doctorId: number): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.baseUrl}/start/${doctorId}`, {});
  }

  // الطبيب بيبدأ محادثة مع مريض
  startAsDoctor(patientId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.baseUrl}/doctor-start/${patientId}`, {});
  }

  getMyConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.baseUrl}/my-conversations`);
  }

  getDoctorConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.baseUrl}/doctor-conversations`);
  }

  getMessages(conversationId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/${conversationId}/messages`);
  }

  sendMessage(conversationId: number, dto: SendMessageDto): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.baseUrl}/${conversationId}/messages`, dto);
  }

  markAsRead(conversationId: number): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${conversationId}/read`, {});
  }
}
