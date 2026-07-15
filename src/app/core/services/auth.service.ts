import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

import { LoginPayload, RegisterPayload, AuthResponse } from '../models/auth.models';

const TOKEN_KEY = 'token';
const DOCTOR_ID_KEY = 'doctorId';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // استخدام الـ environment كمرجع أساسي للروابط لتوحيد بيئة العمل
  private readonly base = `${environment.apiBaseUrl}/api/Auth`;

  constructor(private http: HttpClient, private router: Router) {}

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getDoctorId(): number | null {
    const id = localStorage.getItem(DOCTOR_ID_KEY);
    return id ? Number(id) : null;
  }

  setDoctorId(doctorId: number | null | undefined): void {
    if (doctorId === null || doctorId === undefined) {
      localStorage.removeItem(DOCTOR_ID_KEY);
    } else {
      localStorage.setItem(DOCTOR_ID_KEY, doctorId.toString());
    }
  }

  // دمج منطق الـ Login من الفرعين لحفظ كافة البيانات المطلوبة
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, payload).pipe(
      tap(res => {
        if (res.isAuthenticated) {
          this.setAccessToken(res.token);
          this.setDoctorId(res.doctorId);
          localStorage.setItem('userEmail', res.email);
          localStorage.setItem('userRoles', JSON.stringify(res.roles));
          localStorage.setItem('userId', res.userId);
        }
      })
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, payload);
  }

  // دمج الـ Logout لتنظيف الذاكرة بالكامل من بيانات الطبيب والمستخدم العادي مع التوجيه لصفحة تسجيل الدخول
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DOCTOR_ID_KEY);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userId');
    this.router.navigate(['/auth/login']);
  }

  // استدعاء خارجي للـ Logout كـ API إن وُجد (مُبقى عليه كدعم لفرع نسرين)
  logoutApi(): Observable<any> {
    return this.http.post(`${this.base}/logout`, {}).pipe(
      tap(() => {
        this.logout();
      })
    );
  }

  forgotPassword(email: string, clientBaseUrl: string): Observable<any> {
    return this.http.post(`${this.base}/forgot-password`, { email, clientBaseUrl });
  }

  resetPassword(userId: string, token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.base}/reset-password`, { userId, token, newPassword, confirmPassword });
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      return Date.now() < decoded.exp * 1000;
    } catch {
      return false;
    }
  }

  getUserRoles(): string[] {
    const token = this.getAccessToken();
    if (!token) return [];
    try {
      const decoded: any = jwtDecode(token);
      return decoded.roles || decoded.role || [];
    } catch {
      return [];
    }
  }

  getCurrentUser(): any {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  getToken(): string | null { 
    return this.getAccessToken(); 
  }
  
  isAdmin(): boolean { 
    return this.getUserRoles().includes('Admin');   
  }
  
  isDoctor(): boolean { 
    return this.getUserRoles().includes('Doctor');  
  }
  
  isPatient(): boolean { 
    return this.getUserRoles().includes('Patient'); 
  }

  confirmEmail(userId: string, token: string): Observable<AuthResponse> {
  return this.http.get<AuthResponse>(`${this.base}/confirm-email?userId=${userId}&token=${token}`).pipe(
    tap(res => {
      if (res.isAuthenticated) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userEmail', res.email);
        localStorage.setItem('userRoles', JSON.stringify(res.roles));
        localStorage.setItem('userId', res.userId);
      }
    })
  );
}

  resendConfirmationEmail(email: string, clientBaseUrl: string = 'https://mawed.runasp.net/api'): Observable<any> {
    return this.http.post(`${this.base}/resend-confirmation-email`, { email, clientBaseUrl });
  }
}