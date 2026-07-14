import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// شكل عام لرد بدء الدفع (Paymob) - غالبًا بيرجع رابط أو iframe token
export interface InitiatePaymentResponse {
  paymentKey?: string;
  iframeUrl?: string;
  paymentUrl?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  // بيبدأ عملية الدفع لموعد معين وبيرجع بيانات Paymob (رابط الدفع/iframe)
  initiate(appointmentId: number): Observable<InitiatePaymentResponse> {
    return this.http.post<InitiatePaymentResponse>(`${this.baseUrl}/initiate/${appointmentId}`, {});
  }

  // ملحوظة: /api/payments/paymob-webhook مستدعى من Paymob مباشرة (Server-to-Server)
  // ومش المفروض يتنادى من الفرونت إند، فمش هنستخدمه هنا.
}
