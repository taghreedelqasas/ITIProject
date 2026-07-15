import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BulkCreateDoctorAvailabilityDto,
  CreateDoctorAvailabilityDto,
  DoctorAvailability,
  UpdateDoctorAvailabilityDto,
} from '../models/availability.model';

@Injectable({ providedIn: 'root' })
export class DoctorAvailabilityService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/DoctorAvailability`;

  constructor(private http: HttpClient) {}

  create(dto: CreateDoctorAvailabilityDto): Observable<DoctorAvailability> {
    return this.http.post<DoctorAvailability>(this.baseUrl, dto);
  }

  createBulk(dto: BulkCreateDoctorAvailabilityDto): Observable<DoctorAvailability[]> {
    return this.http.post<DoctorAvailability[]>(`${this.baseUrl}/bulk`, dto);
  }

  update(id: number, dto: UpdateDoctorAvailabilityDto): Observable<DoctorAvailability> {
    return this.http.put<DoctorAvailability>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getById(id: number): Observable<DoctorAvailability> {
    return this.http.get<DoctorAvailability>(`${this.baseUrl}/${id}`);
  }

  getByDoctor(doctorId: number): Observable<DoctorAvailability[]> {
    return this.http.get<DoctorAvailability[]>(`${this.baseUrl}/doctor/${doctorId}`);
  }

  // الأوقات المتاحة فعليًا للحجز (مش محجوزة) لطبيب معين - دي المستخدمة في شاشة الحجز
  getAvailableByDoctor(doctorId: number): Observable<DoctorAvailability[]> {
    return this.http.get<DoctorAvailability[]>(`${this.baseUrl}/doctor/${doctorId}/available`);
  }
}
