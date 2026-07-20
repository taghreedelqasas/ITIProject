// src/app/core/services/admin-appointments.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminAppointmentsPagedResultDto,
  AdminAppointmentsSummaryDto,
  AppointmentStatusValue,
} from '../models/admin-dashboard.models';

/**
 * يغطي:
 *   GET api/admin/appointments?page=&pageSize=&status=&date=&search=
 *   GET api/admin/appointments/summary
 */
@Injectable({ providedIn: 'root' })
export class AdminAppointmentsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin/appointments`;

  constructor(private readonly http: HttpClient) {}

  getAppointments(options: {
    page: number;
    pageSize: number;
    status?: AppointmentStatusValue | null;
    date?: string | null; // "yyyy-MM-dd"
    search?: string | null;
  }): Observable<AdminAppointmentsPagedResultDto> {
    let params = new HttpParams().set('page', options.page).set('pageSize', options.pageSize);

    if (options.status) params = params.set('status', options.status);
    if (options.date) params = params.set('date', options.date);
    if (options.search) params = params.set('search', options.search);

    return this.http.get<AdminAppointmentsPagedResultDto>(this.baseUrl, { params });
  }

  getSummary(): Observable<AdminAppointmentsSummaryDto> {
    return this.http.get<AdminAppointmentsSummaryDto>(`${this.baseUrl}/summary`);
  }
}
