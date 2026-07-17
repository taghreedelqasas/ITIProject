import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Doctor, DoctorCreateDto, DoctorSearchParams, DoctorUpdateDto } from '../models/doctor.model';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Doctor`;

  constructor(private http: HttpClient) {}

  getAll(searchParams?: DoctorSearchParams): Observable<Doctor[]> {
    let params = new HttpParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http.get<Doctor[]>(this.baseUrl, { params });
  }
// -------------------------------------------
  getById(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.baseUrl}/${id}`);
  }

  create(dto: DoctorCreateDto): Observable<Doctor> {
    return this.http.post<Doctor>(this.baseUrl, dto);
  }

  update(id: number, dto: DoctorUpdateDto): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
