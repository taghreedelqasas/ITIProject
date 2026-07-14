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

  login(data: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/api/Auth/login`, data).pipe(
      tap((res: AuthResponse) => {
        this.setAccessToken(res.token);
        this.setDoctorId(res.doctorId);
      })
    );
  }

  register(data: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, data).pipe(
      tap((res: AuthResponse) => this.setAccessToken(res.token))
    );
  }

  logout(): void {
   localStorage.removeItem(TOKEN_KEY);
   localStorage.removeItem(DOCTOR_ID_KEY);
    this.router.navigate(['/login']);
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
}