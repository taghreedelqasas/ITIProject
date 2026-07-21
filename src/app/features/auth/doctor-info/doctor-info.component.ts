import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegistrationDataService } from '../../../core/services/registration-data.service';

@Component({
  selector: 'app-doctor-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-info.component.html',
  styleUrls: ['./doctor-info.component.css']
})
export class DoctorInfoComponent implements OnInit {

  infoForm!: FormGroup;
  isLoading = false;
  apiError  = '';

  departments = [
    { id: 1, name: 'طب عام'},
    {id: 2, name: 'طب اسنان'},
    {id: 3, name : 'جراحة العيون'},
    {id : 4, name :'عظام'},
    {id :5, name:'مخ و اعصاب'}
  ];

  ssnImageFile: File | null = null;
  licenseImageFile: File | null = null;
  certificateImageFile: File | null = null;

  private basicInfo: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private registrationData: RegistrationDataService
  ) {}

  ngOnInit(): void {
    this.basicInfo = this.registrationData.getBasicInfo();

    if (!this.basicInfo) {
      this.router.navigate(['/auth/register']);
      return;
    }

    this.infoForm = this.fb.group({
      departmentId:      [1, Validators.required],
      yearsOfExperience:  ['', [Validators.required, Validators.min(0), Validators.max(60)]],
      address:            ['', Validators.required],
      licenseNumber:      ['', Validators.required]
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.infoForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onFileSelected(event: Event, type: 'ssn' | 'license' | 'certificate'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (type === 'ssn') this.ssnImageFile = file;
    if (type === 'license') this.licenseImageFile = file;
    if (type === 'certificate') this.certificateImageFile = file;
  }

  get allDocsUploaded(): boolean {
    return !!this.ssnImageFile && !!this.licenseImageFile && !!this.certificateImageFile;
  }

  private calculateGraduationDate(yearsOfExperience: number): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsOfExperience);
    return date.toISOString().split('T')[0];
  }

  // بتحول الملف لـ base64 string (من غير الـ prefix بتاع data:image/...;base64,)
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // شيل الـ prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    if (!this.allDocsUploaded) {
      this.apiError = 'من فضلك أرفع جميع المستندات المطلوبة';
      return;
    }

    this.isLoading = true;
    this.apiError  = '';

    const { yearsOfExperience, address, licenseNumber } = this.infoForm.value;
    const graduationDate = this.calculateGraduationDate(+yearsOfExperience);

    try {
      const [ssnImageBase64, licenseImageBase64, certificateImageBase64] = await Promise.all([
        this.fileToBase64(this.ssnImageFile!),
        this.fileToBase64(this.licenseImageFile!),
        this.fileToBase64(this.certificateImageFile!)
      ]);

      const payload = {
        ...this.basicInfo,
        ssn: '00000000000000',
        licenseNumber,
        certificate: '',
        address,
        graduationDate,
        departmentId: 1,
        ssnImage: ssnImageBase64,
        licenseImage: licenseImageBase64,
        certificateImage: certificateImageBase64
      };

      const email = this.basicInfo.email;

      this.authService.register(payload).subscribe({
        next: () => this.finishAndNavigate(email),
        error: (err) => {
          this.isLoading = false;
          this.finishAndNavigate(email);
          this.apiError = err?.error?.message || '';
        }
      });

    } catch (e) {
      this.isLoading = false;
      this.apiError = 'حصل خطأ أثناء معالجة الصور، حاول تاني';
    }
  }

  private finishAndNavigate(email: string): void {
    this.isLoading = false;
    this.registrationData.clear();
    this.router.navigate(['/auth/confirm-email-notice'], { queryParams: { email } });
  }
}