import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';


function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  apiError = '';
  successMessage = '';

  
  userId: string = '';
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/)
        ]
      ],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] || '';
      this.token = params['token'] || '';

     // console.log(' userId:', this.userId);
      //console.log(' token:', this.token);

      
      if (!this.userId || !this.token) {
        this.apiError = 'رابط غير صالح. يرجى المحاولة مرة أخرى.';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      }
    });
  }

  
  get hasMinLength(): boolean {
    const password = this.resetPasswordForm.get('newPassword')?.value || '';
    return password.length >= 8;
  }

  get hasUpperCase(): boolean {
    const password = this.resetPasswordForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(password);
  }

  get hasSpecialChar(): boolean {
    const password = this.resetPasswordForm.get('newPassword')?.value || '';
    return /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  isInvalid(field: string): boolean {
    const control = this.resetPasswordForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.apiError = '';
    this.successMessage = '';

    const { newPassword, confirmPassword } = this.resetPasswordForm.value;

    
    this.authService.resetPassword(
      this.userId,
      this.token,
      newPassword,
      confirmPassword
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'تم تحديث كلمة المرور بنجاح! سيتم توجيهك إلى صفحة تسجيل الدخول...';
       // console.log(' Password reset success:', response);

        
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(' Password reset error:', err);
        
        
        this.apiError = err?.error?.message || err?.error?.[0] || 'حدث خطأ. حاول مرة أخرى.';
      }
    });
  }
}