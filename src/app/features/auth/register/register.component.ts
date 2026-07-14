import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  selectedRole: 'Patient' | 'Doctor' = 'Patient';
  showPassword  = false;
  showConfirm   = false;
  isLoading     = false;
  apiError      = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName:        ['', [Validators.required, Validators.minLength(3)]],
      email:           ['', [Validators.required, Validators.email]],
      phone:           ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      birthDate:       ['', Validators.required],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms:           [false, Validators.requiredTrue]
    }, { validators: passwordMatchValidator });
  }

  selectRole(role: 'Patient' | 'Doctor'): void {
    this.selectedRole = role;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.apiError  = '';

    const { fullName, email, phone, birthDate, password, confirmPassword } = this.registerForm.value;
    const nameParts = fullName.trim().split(' ');

    const payload = {
      firstName:       nameParts[0],
      lastName:        nameParts.slice(1).join(' ') || nameParts[0],
      email,
      userName:        email.split('@')[0],
      phoneNumber:     phone,
      birthDate,
      ssn: this.selectedRole === 'Doctor' ? '' : '00000000000000',
      password,
      confirmPassword,
      role:            this.selectedRole,
      clientBaseUrl:   'https://localhost:7150'
    };

  this.authService.register(payload).subscribe({
  next: (res) => {
    this.isLoading = false;
    this.router.navigate(['/auth/confirm-email-notice'], {
      queryParams: { email }
    });
  },
  error: (err) => {
    this.isLoading = false;
    this.router.navigate(['/auth/confirm-email-notice'], {
      queryParams: { email }
    });
  }
});
  }
}