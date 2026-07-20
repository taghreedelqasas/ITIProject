// src/app/core/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * بيغطي endpoints بتاعة AuthController.cs اللي محتاجينها هنا فعليًا.
 *   POST api/auth/logout   (Authorize) - الباك بيرجع بس { message } لأن التوكن JWT
 *   stateless ومفيش invalidation/blacklist من جهة السيرفر، فالـ logout الحقيقي
 *   بيحصل من جهة الفرونت (مسح التوكن المحفوظ).
 *
 * ملحوظة: لسه مفيش صفحة login/AuthService كامل لإدارة التوكن في المشروع ده،
 * فده أقل حاجة لازمة تشتغل بيها شاشة تسجيل الخروج من غير ما نخترع نظام auth كامل.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/auth`;

  constructor(private readonly http: HttpClient) {}

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/logout`, {});
  }
}
