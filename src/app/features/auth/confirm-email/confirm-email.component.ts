import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
  userId: string = '';
  token: string = '';
  isLoading = true;
  apiError = '';
  isConfirmed = false;
  userRole: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] || '';
      this.token = params['token'] || '';

      console.log('📌 userId:', this.userId);
      console.log('📌 token:', this.token);

      if (this.userId && this.token) {
        this.confirmEmail();
      } else {
        this.isLoading = false;
        this.apiError = 'رابط غير صالح. يرجى المحاولة مرة أخرى.';
      }
    });
  }

  confirmEmail(): void {
    this.isLoading = true;
    this.apiError = '';

    this.authService.confirmEmail(this.userId, this.token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isConfirmed = true;
        this.userRole = response.roles?.[0] || '';
        
        console.log('✅ Email confirmed successfully!', response);
        console.log('👤 User Role:', this.userRole);
        
        // ✅ حفظ البيانات في localStorage
        if (response.isAuthenticated) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userEmail', response.email);
          localStorage.setItem('userRoles', JSON.stringify(response.roles));
          localStorage.setItem('userId', response.userId);
        }

        // ✅ Redirect تلقائي بعد 2 ثانية
        setTimeout(() => {
          this.redirectBasedOnRole(this.userRole);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Email confirmation error:', err);
        this.apiError = err?.error?.message || err?.error?.[0] || 'حدث خطأ أثناء تأكيد البريد الإلكتروني.';
      }
    });
  }

  private redirectBasedOnRole(role: string): void {
  if (role === 'Doctor') {
    // ✅ الدكتور يروح لصفحة المعلومات المهنية
    this.router.navigate(['/auth/doctor-info']);
  } else if (role === 'Patient') {
    this.router.navigate(['/patient/dashboard']);
  } else if (role === 'Admin') {
    this.router.navigate(['/admin/dashboard']);
  } else {
    this.router.navigate(['/auth/login']);
  }
}

  // ✅ دوال الأزرار (لو المستخدم عايز يضغط بدل الانتظار)
  goToDashboard(): void {
    const roles = this.authService.getUserRoles();
    if (roles.includes('Admin')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (roles.includes('Doctor')) {
      this.router.navigate(['/auth/doctor-info'], {
        queryParams: { token: this.token }
      });
    } else if (roles.includes('Patient')) {
      this.router.navigate(['/patient/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}