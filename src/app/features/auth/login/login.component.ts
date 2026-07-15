import { Component, OnInit } from '@angular/core'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit { 
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  apiError = '';
  returnUrl: string = ''; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  isInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  private redirectBasedOnRoles(roles: string[]): void {
    if (roles.includes('Admin')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (roles.includes('Doctor')) {
      this.router.navigate(['/doctor-dashboard/main']); // التوجيه الصحيح للدكتور
    } else if (roles.includes('Patient')) {
      this.router.navigate(['/']);   
    } else {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.apiError = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log(' Successfully login');

        // جلب الـ Roles أولاً لتحديد هوية المستخدم
        const roles = this.authService.getUserRoles();
        const finalRoles = roles.length > 0 ? roles : (response.roles || []);

        // التعديل الذكي والآمن هنا: 
        // لو المستخدم مريض (Patient) وكان رايح لصفحة الحجز (booking)، نوديه للحجز
        if (finalRoles.includes('Patient') && this.returnUrl && this.returnUrl.includes('/booking')) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          // في أي حالة تانية (سواء دكتور، أو مريض داخل عادي) يروح لصفحته المخصصة حسب الـ Role
          if (finalRoles.length > 0) {
            this.redirectBasedOnRoles(finalRoles);
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('login fail');
        this.apiError = err.error?.message || ' login again';
      }
    });
  }
}