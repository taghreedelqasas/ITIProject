import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConversationService } from '../../core/services/conversation.service';

interface Country {
  code: string; // كود الدولة الدولي مثل +20
  flag: string; // إيموجي العلم
  name: string;
}

interface ConsultRequestData {
  fullName: string;
  phone: string;
  age: number | null;
  gender: string;
  reason: string;
}

@Component({
  selector: 'app-consult-request',
  imports: [CommonModule, FormsModule],
  templateUrl: './consult-request.html',
  styleUrl: './consult-request.css',
})
export class ConsultRequest {
  pageTitle = 'طلب إستشارة';
  pageSubtitle = 'تابع مع طبيبك بكل سهولة مع موعد';

  doctorId: number | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private conversationService: ConversationService
  ) {
    const params = this.route.snapshot.queryParamMap;

    const doctorIdParam = params.get('doctorId');
    this.doctorId = doctorIdParam ? Number(doctorIdParam) : null;

    const doctorName = params.get('doctorName');
    if (doctorName) {
      this.doctor.name = doctorName;
      this.doctor.specialty = params.get('specialty') || this.doctor.specialty;
      this.doctor.location = params.get('location') || this.doctor.location;
      this.doctorImage = params.get('image') || this.doctorImage;

      const rating = params.get('rating');
      if (rating) this.doctor.rating = Number(rating);

      const reviewsCount = params.get('reviewsCount');
      if (reviewsCount) this.doctor.reviewsCount = Number(reviewsCount);
    }
  }

  // ================== بيانات الطبيب ==================
  doctor = {
    name: 'د. سارة إبراهيم',
    specialty: 'طب العظام - إستشارية جراحة العظام',
    location: 'المنصورة، حي الجامعة',
    rating: 4.8,
    reviewsCount: 100,
  };

  doctorImage = 'doctor_photo.png';

  // ================== بيانات المريض ==================
  countries: Country[] = [
    { code: '+20', flag: '🇪🇬', name: 'مصر' },
    { code: '+966', flag: '🇸🇦', name: 'السعودية' },
    { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
    { code: '+965', flag: '🇰🇼', name: 'الكويت' },
    { code: '+962', flag: '🇯🇴', name: 'الأردن' },
  ];
  selectedCountry: Country = this.countries[0];
  isCountryMenuOpen = false;

  patient: ConsultRequestData = {
    fullName: '',
    phone: '',
    age: null,
    gender: '',
    reason: '',
  };

  submitted = false;

  toggleCountryMenu(): void {
    this.isCountryMenuOpen = !this.isCountryMenuOpen;
  }

  selectCountry(country: Country): void {
    this.selectedCountry = country;
    this.isCountryMenuOpen = false;
  }

  get isFormValid(): boolean {
    return this.patient.fullName.trim().length > 0 && this.patient.phone.trim().length > 0;
  }

  onSubmit(): void {
    if (!this.isFormValid || !this.doctorId || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    // نداء API: POST /api/Conversation/start/{doctorId} لبدء محادثة مع الطبيب
    this.conversationService.startAsPatient(this.doctorId).subscribe({
      next: (conversation) => {
        const conversationId = conversation?.id;
        const reasonMessage =
          this.patient.reason ||
          `طلب إستشارة من ${this.patient.fullName} - ${this.selectedCountry.code}${this.patient.phone}`;

        if (!conversationId) {
          this.isLoading = false;
          this.submitted = true;
          return;
        }

        // نداء API: POST /api/Conversation/{conversationId}/messages لإرسال أول رسالة تحتوي سبب الإستشارة
        this.conversationService.sendMessage(conversationId, { content: reasonMessage }).subscribe({
          next: () => {
            this.isLoading = false;
            this.submitted = true;
          },
          error: () => {
            // المحادثة اتعملت بنجاح حتى لو فشل إرسال أول رسالة
            this.isLoading = false;
            this.submitted = true;
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'تعذر إرسال طلب الإستشارة، حاول مرة أخرى.';
      },
    });
  }

  onBack(): void {
    if (this.submitted) {
      this.router.navigate(['/']);
    } else {
      this.location.back();
    }
  }
}
