import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

import { LoginPayload, RegisterPayload, AuthResponse } from '../models/auth.models';


const TOKEN_KEY = 'token';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly base = 'https://mawed.runasp.net/api/Auth';
  constructor(private http: HttpClient, private router: Router) {}

  getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

  setAccessToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, payload).pipe(
      tap(res => {
        if (res.isAuthenticated) {
          localStorage.setItem('token',     res.token);
          localStorage.setItem('userEmail', res.email);
          localStorage.setItem('userRoles', JSON.stringify(res.roles));
          localStorage.setItem('userId',    res.userId);
        }
      })
    );
  }

   register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, payload);
  }


  logout(): Observable<any> {
    return this.http.post(`${this.base}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRoles');
        localStorage.removeItem('userId');
      })
    );
  }

  forgotPassword(email: string, clientBaseUrl: string): Observable<any> {
   // const clientBaseUrl = 'https://localhost:4200';
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