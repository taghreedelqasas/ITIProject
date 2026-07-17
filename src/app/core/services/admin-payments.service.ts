// src/app/core/services/admin-payments.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminTransactionsPagedResultDto,
  CommissionRateDto,
  PaymentStatusValue,
  PaymentsSummaryDto,
  RevenueCommissionTrendDto,
} from '../models/admin-payments.models';

/**
 * يغطي بالظبط الـ 5 endpoints بتاعة شاشة "المدفوعات والعمولات" في AdminController:
 *   GET api/admin/payments/summary
 *   GET api/admin/payments/commission-rate
 *   PUT api/admin/payments/commission-rate
 *   GET api/admin/payments/revenue-trend?months=
 *   GET api/admin/payments/transactions?page=&pageSize=&status=
 */
@Injectable({ providedIn: 'root' })
export class AdminPaymentsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin/payments`;

  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<PaymentsSummaryDto> {
    return this.http.get<PaymentsSummaryDto>(`${this.baseUrl}/summary`);
  }

  getCommissionRate(): Observable<CommissionRateDto> {
    return this.http.get<CommissionRateDto>(`${this.baseUrl}/commission-rate`);
  }

  updateCommissionRate(
    newRate: number
  ): Observable<{ message: string; data: CommissionRateDto }> {
    return this.http.put<{ message: string; data: CommissionRateDto }>(
      `${this.baseUrl}/commission-rate`,
      { commissionRate: newRate }
    );
  }

  getRevenueCommissionTrend(months = 6): Observable<RevenueCommissionTrendDto> {
    const params = new HttpParams().set('months', months);
    return this.http.get<RevenueCommissionTrendDto>(`${this.baseUrl}/revenue-trend`, { params });
  }

  getTransactions(options: {
    page: number;
    pageSize: number;
    status?: PaymentStatusValue | null;
  }): Observable<AdminTransactionsPagedResultDto> {
    let params = new HttpParams().set('page', options.page).set('pageSize', options.pageSize);
    if (options.status) params = params.set('status', options.status);

    return this.http.get<AdminTransactionsPagedResultDto>(`${this.baseUrl}/transactions`, {
      params,
    });
  }
}
