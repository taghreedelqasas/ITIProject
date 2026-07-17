// src/app/core/services/admin-withdraw.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WithdrawRequestAdminDto } from '../models/admin-withdraw.models';

/**
 * يغطي بالظبط الـ 3 endpoints بتاعة AdminWithdrawController:
 *   GET api/admin/withdraw-requests            -> List<WithdrawRequestAdminDto> (الطلبات المعلقة فقط)
 *   PUT api/admin/withdraw-requests/{id}/approve
 *   PUT api/admin/withdraw-requests/{id}/reject
 *
 * ملحوظة: الباك بيرجع ServiceResult في الـ approve/reject ({ success, message })
 * مش object تاني، فمش محتاجين موديل منفصل ليه.
 */
@Injectable({ providedIn: 'root' })
export class AdminWithdrawService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin/withdraw-requests`;

  constructor(private readonly http: HttpClient) {}

  getPendingRequests(): Observable<WithdrawRequestAdminDto[]> {
    return this.http.get<WithdrawRequestAdminDto[]>(this.baseUrl);
  }

  approve(requestId: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.baseUrl}/${requestId}/approve`,
      {}
    );
  }

  reject(requestId: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.baseUrl}/${requestId}/reject`,
      {}
    );
  }
}
