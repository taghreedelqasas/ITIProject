import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReviewDto, Review, UpdateReviewDto } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Reviews`;

  constructor(private http: HttpClient) {}

  create(dto: CreateReviewDto): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateReviewDto): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/my`);
  }

  getByDoctor(doctorId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/doctors/${doctorId}`);
  }

  // حذف من لوحة تحكم الأدمن
  deleteAsAdmin(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}/admin`);
  }
}
