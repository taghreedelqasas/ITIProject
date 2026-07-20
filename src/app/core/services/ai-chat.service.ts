import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Chat`;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // تعديل الدالة لتستقبل الـ payload الكامل (الرسالة + الـ sessionId)
  sendMessage(payload: { message: string; sessionId: string | null }): Observable<any> {
    return this.http.post(this.baseUrl, payload, { headers: this.getAuthHeaders() });
  }

  // تعديل لتمرير الـ sessionId مع الـ PDF لو موجود
  analyzePdf(file: File, sessionId: string | null): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (sessionId) {
      formData.append('sessionId', sessionId);
    }
    return this.http.post(`${this.baseUrl}/analyze-pdf`, formData, { headers: this.getAuthHeaders() });
  }

  // تعديل لتمرير الـ sessionId مع الصورة لو موجود
  analyzeImage(file: File, sessionId: string | null): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (sessionId) {
      formData.append('sessionId', sessionId);
    }
    return this.http.post(`${this.baseUrl}/analyze-image`, formData, { headers: this.getAuthHeaders() });
  }

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history`, { headers: this.getAuthHeaders() });
  }
}