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

  uploadAttachment(conversationId: number, file: File, caption: string): Observable<unknown> {
    const formData = new FormData();
    formData.append('ContentType', file.type);
    formData.append('ContentDisposition', `form-data; name="file"; filename="${file.name}"`);
    formData.append('Headers', '{}');
    formData.append('Length', file.size.toString());
    formData.append('Name', file.name);
    formData.append('FileName', file.name);
    formData.append('caption', caption);
    formData.append('file', file, file.name);
    return this.http.post(`${this.baseUrl}/${conversationId}/attachments`, formData);
  }
}
