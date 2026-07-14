import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Appointment,
  AvailableSlot,
  BookAppointmentDto,
  RescheduleAppointmentDto,
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly baseUrl = `${environment.apiBaseUrl}/Appointments`;

  constructor(private http: HttpClient) {}

  getAvailableSlots(doctorId: number): Observable<AvailableSlot[]> {
    return this.http.get<AvailableSlot[]>(`${this.baseUrl}/doctors/${doctorId}/available-slots`);
  }

  book(dto: BookAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(this.baseUrl, dto);
  }

  cancel(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}/cancel`);
  }

  reschedule(id: number, dto: RescheduleAppointmentDto): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.baseUrl}/${id}/reschedule`, dto);
  }

  // مواعيد المريض الحالي
  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/my`);
  }

  // مواعيد الطبيب الحالي (لو المستخدم دوره طبيب)
  getDoctorAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/doctor/my`);
  }

  confirm(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/${id}/confirm`, {});
  }

  complete(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/${id}/complete`, {});
  }
}
