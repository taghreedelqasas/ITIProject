import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatReplyResponse {
  reply: string;
}

export interface FileAnalysisResponse {
  explanation: string;
}

@Injectable({
  providedIn: 'root'
})
export class Chat {
  private baseUrl = `${environment.apiUrl}/Chat`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatReplyResponse> {
    return this.http.post<ChatReplyResponse>(this.baseUrl, { message });
  }

  analyzeImage(file: File): Observable<FileAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FileAnalysisResponse>(`${this.baseUrl}/analyze-image`, formData);
  }

  analyzePdf(file: File): Observable<FileAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FileAnalysisResponse>(`${this.baseUrl}/analyze-pdf`, formData);
  }
}
