// src/app/core/services/admin-people.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminDoctorDetailDto,
  AdminDoctorDto,
  AdminPatientDetailDto,
  AdminPatientDto,
  DoctorPendingDto,
  DoctorsOverviewDto,
} from '../models/admin-dashboard.models';

/**
 * يغطي:
 *   GET api/admin/patients          -> List<AdminPatientDto>
 *   GET api/admin/doctors           -> List<AdminDoctorDto>
 *   GET api/admin/patients/{id}     -> AdminPatientDetailDto (بروفايل كامل)
 *   GET api/admin/doctors/{id}      -> AdminDoctorDetailDto (بروفايل كامل)
 *   GET api/admin/doctors/overview  -> DoctorsOverviewDto (كروت الـ KPI)
 *   GET api/admin/pending-doctors   -> List<DoctorPendingDto>
 *   PUT api/admin/approve-doctor/{userId}
 *   PUT api/admin/reject-doctor/{userId}  (body: { reason?: string })
 *
 * ملحوظة مهمة: قائمة patients/doctors مفيهاش أي query params (لا بحث، لا فلترة، لا Pagination) -
 * بترجع كل الصفوف مرة واحدة. البحث/الفلترة/التقسيم لصفحات بيحصلوا Client-side في الكومبوننت.
 */
@Injectable({ providedIn: 'root' })
export class AdminPeopleService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin`;

  constructor(private readonly http: HttpClient) {}

  getAllPatients(): Observable<AdminPatientDto[]> {
    return this.http.get<AdminPatientDto[]>(`${this.baseUrl}/patients`);
  }

  getAllDoctors(): Observable<AdminDoctorDto[]> {
    return this.http.get<AdminDoctorDto[]>(`${this.baseUrl}/doctors`);
  }

  getPatientDetail(id: number): Observable<AdminPatientDetailDto> {
    return this.http.get<AdminPatientDetailDto>(`${this.baseUrl}/patients/${id}`);
  }

  getDoctorDetail(id: number): Observable<AdminDoctorDetailDto> {
    return this.http.get<AdminDoctorDetailDto>(`${this.baseUrl}/doctors/${id}`);
  }

  getDoctorsOverview(): Observable<DoctorsOverviewDto> {
    return this.http.get<DoctorsOverviewDto>(`${this.baseUrl}/doctors/overview`);
  }

  getPendingDoctors(): Observable<DoctorPendingDto[]> {
    return this.http.get<DoctorPendingDto[]>(`${this.baseUrl}/pending-doctors`);
  }

  approveDoctor(userId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/approve-doctor/${userId}`, {});
  }

  rejectDoctor(userId: string, reason?: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/reject-doctor/${userId}`, { reason });
  }
}
