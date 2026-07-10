// dashboard/dashboard.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AppointmentStatusDistribution,
  DashboardOverview,
  MonthlyTrend,
  TrendType,
} from './models/dashboard.models';

// غيّر ده لو الـ base url بتاعك مختلف (أو استخدم environment.apiUrl)
const API_BASE = 'https://mawed.runasp.net/api/admin/dashboard';
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${API_BASE}/overview`);
  }

  getAppointmentsDistribution(
    year?: number,
    month?: number
  ): Observable<AppointmentStatusDistribution> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    if (month) params = params.set('month', month);

    return this.http.get<AppointmentStatusDistribution>(
      `${API_BASE}/appointments-distribution`,
      { params }
    );
  }

  getMonthlyTrend(type: TrendType = 'appointments', months = 12): Observable<MonthlyTrend> {
    const params = new HttpParams()
      .set('type', type)
      .set('months', months);

    return this.http.get<MonthlyTrend>(`${API_BASE}/monthly-trend`, { params });
  }
}