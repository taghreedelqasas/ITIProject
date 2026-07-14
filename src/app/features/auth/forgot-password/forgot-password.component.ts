import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  apiError = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isInvalid(field: string): boolean {
    const control = this.forgotPasswordForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.apiError = '';
    this.successMessage = '';

    const email = this.forgotPasswordForm.get('email')?.value;
    const clientBaseUrl = 'http://localhost:4200'; 

   
    this.authService.forgotPassword(email, clientBaseUrl).subscribe({
    next: (response) => {
      this.isLoading = false;
      this.successMessage = '✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني';
    //  console.log('✅ Forgot password success:', response);
      this.forgotPasswordForm.reset();
    },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Forgot password error:', err);
        
        
        this.apiError = err?.error?.message || err?.error?.[0] || 'حدث خطأ. حاول مرة أخرى.';
      }
    });
  }
}