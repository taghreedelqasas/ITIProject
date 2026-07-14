import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  apiError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

private redirectBasedOnRoles(roles: string[]): void {
  if (roles.includes('Admin')) {
    this.router.navigate(['/admin/dashboard']);
  } else if (roles.includes('Doctor')) {
    this.router.navigate(['/doctor-dashboard']);
  } else if (roles.includes('Patient')) {
    this.router.navigate(['/profile']);   
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
      
         

  //  --------------
        const roles = this.authService.getUserRoles();

        if (roles.length > 0) {
          this.redirectBasedOnRoles(roles);
        } else if (response.roles && response.roles.length > 0) {
          this.redirectBasedOnRoles(response.roles);
        } else {
          this.router.navigate(['/']);
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