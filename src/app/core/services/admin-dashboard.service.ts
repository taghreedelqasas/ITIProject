// src/app/core/services/admin-dashboard.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AppointmentStatusDistributionDto,
  DashboardOverviewDto,
  MonthlyTrendDto,
  TrendType,
} from '../models/admin-dashboard.models';

/**
 * بيغطي بالظبط الـ 3 endpoints بتاعة الداشبورد في AdminController:
 *   GET api/admin/dashboard/overview
 *   GET api/admin/dashboard/appointments-distribution?year=&month=
 *   GET api/admin/dashboard/monthly-trend?type=&months=
 */
@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin/dashboard`;

  constructor(private readonly http: HttpClient) {}

  getOverview(): Observable<DashboardOverviewDto> {
    return this.http.get<DashboardOverviewDto>(`${this.baseUrl}/overview`);
  }

  getAppointmentsDistribution(
    year?: number,
    month?: number
  ): Observable<AppointmentStatusDistributionDto> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', year);
    if (month != null) params = params.set('month', month);

    return this.http.get<AppointmentStatusDistributionDto>(
      `${this.baseUrl}/appointments-distribution`,
      { params }
    );
  }

  getMonthlyTrend(type: TrendType = 'appointments', months = 12): Observable<MonthlyTrendDto> {
    const params = new HttpParams().set('type', type).set('months', months);

    return this.http.get<MonthlyTrendDto>(`${this.baseUrl}/monthly-trend`, { params });
  }
}
