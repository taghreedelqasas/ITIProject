import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InitiatePaymentResponse {
  message: string;
  data: {
    paymentId: number;
    iframeUrl: string;
  };
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  initiate(appointmentId: number): Observable<InitiatePaymentResponse> {
    return this.http.post<InitiatePaymentResponse>(
      `${this.baseUrl}/initiate/${appointmentId}`,
      { paymentMethod: 'Card' }
    );
  }
}
