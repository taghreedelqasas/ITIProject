import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';
import { DoctorAvailabilityService } from '../../core/services/doctor-availability.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { PaymentService } from '../../core/services/payment.service';
import { ReviewService } from '../../core/services/review.service';
import { Doctor as ApiDoctor } from '../../core/models/doctor.model';
import { DoctorAvailability } from '../../core/models/availability.model';

export interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
}

export interface TimeSlot {
  id: number;
  label: string;
}

export interface Country {
  code: string;
  flag: string;
  name: string;
}

export interface PatientData {
  fullName: string;
  phone: string;
  age: number | null;
  gender: string;
  notes: string;
}

const FALLBACK_IMAGE = 'doctor_photo.png';
const SESSION_KEY = 'booking_state';

export const COUNTRIES: Country[] = [
  { code: '+20', flag: '🇪🇬', name: 'مصر' },
  { code: '+966', flag: '🇸🇦', name: 'السعودية' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن' },
];

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const WEEK_DAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  rebookId: string | null = null;
  fromConsultFlow = false;
  doctorId: number | null = null;
  preselectedSlotId: number | null = null;

  isLoading = signal(false);
  doctorLoaded = signal(false);
  errorMessage = signal('');

  doctor = signal({
    name: '',
    specialty: '',
    location: '',
    rating: 0,
    reviewsCount: 0,
    price: 0,
    avatar: '',
  });

  doctorImage = signal(FALLBACK_IMAGE);

  private allSlots = signal<DoctorAvailability[]>([]);
  selectedSlotId = signal<number | null>(null);
  selectedTime = signal('');

  currentYear = signal(new Date().getFullYear());
  currentMonthIndex = signal(new Date().getMonth());
  selectedDate = signal(new Date().getDate());

  patient = signal<PatientData>({
    fullName: '',
    phone: '',
    age: null,
    gender: '',
    notes: '',
  });

  selectedCountry = signal<Country>(COUNTRIES[0]);
  isCountryMenuOpen = signal(false);

  confirmedAppointmentId = signal<number | null>(null);
  paymentError = signal('');

  paymentOverlayUrl = signal<string | null>(null);

  monthNames = MONTH_NAMES;
  weekDays = WEEK_DAYS;

  monthLabel = computed(() => `${MONTH_NAMES[this.currentMonthIndex()]} ${this.currentYear()}`);

  calendarDays = computed(() => {
    const firstOfMonth = new Date(this.currentYear(), this.currentMonthIndex(), 1);
    const daysInMonth = new Date(this.currentYear(), this.currentMonthIndex() + 1, 0).getDate();
    const startWeekday = firstOfMonth.getDay();
    const cells: (CalendarDay | null)[] = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: d, isCurrentMonth: true });
    }
    return cells;
  });

  timeSlots = computed(() => {
    const slotsForDay = this.allSlots().filter((s) => {
      const d = new Date(s.startTime);
      return (
        d.getFullYear() === this.currentYear() &&
        d.getMonth() === this.currentMonthIndex() &&
        d.getDate() === this.selectedDate()
      );
    });
    const mapped: TimeSlot[] = slotsForDay.map((s) => ({ id: s.id, label: this.formatTime(s.startTime) }));
    const rows: TimeSlot[][] = [];
    for (let i = 0; i < mapped.length; i += 4) {
      rows.push(mapped.slice(i, i + 4));
    }
    return rows;
  });

  isPatientFormValid = computed(() =>
    this.patient().fullName.trim().length > 0 && this.patient().phone.trim().length > 0
  );

  selectedDateLabel = computed(() =>
    `${this.selectedDate()} ${MONTH_NAMES[this.currentMonthIndex()]} ${this.currentYear()}`
  );

  genderLabel = computed(() => {
    const g = this.patient().gender;
    if (g === 'male') return 'ذكر';
    if (g === 'female') return 'أنثى';
    return '-';
  });

  fullPhoneNumber = computed(() => (this.patient().phone ? this.patient().phone : '-'));

  constructor(
    private router: Router,
    private doctorService: DoctorService,
    private availabilityService: DoctorAvailabilityService,
    private appointmentService: AppointmentService,
    private paymentService: PaymentService,
    private reviewService: ReviewService

  ) {
    this.restore();
  }

  private save(): void {
    try {
      const data = {
        doctorId: this.doctorId,
        selectedSlotId: this.selectedSlotId(),
        selectedTime: this.selectedTime(),
        confirmedAppointmentId: this.confirmedAppointmentId(),
        patient: this.patient(),
        selectedCountry: this.selectedCountry(),
        doctor: this.doctor(),
        doctorImage: this.doctorImage(),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch {}
  }

  private restore(): boolean {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data?.doctorId) return false;

      this.doctorId = data.doctorId;
      this.selectedSlotId.set(data.selectedSlotId ?? null);
      this.selectedTime.set(data.selectedTime ?? '');
      this.confirmedAppointmentId.set(data.confirmedAppointmentId ?? null);
      this.patient.set(data.patient ?? { fullName: '', phone: '', age: null, gender: '', notes: '' });
      this.selectedCountry.set(data.selectedCountry ?? COUNTRIES[0]);
      if (data.doctor) this.doctor.set(data.doctor);
      if (data.doctorImage) this.doctorImage.set(data.doctorImage);
      return true;
    } catch {
      return false;
    }
  }

  initFromQueryParams(params: { [key: string]: string | null }): void {
    this.rebookId = params['rebookId'];
    this.fromConsultFlow = params['fromConsult'] === 'true';
    const doctorIdParam = params['doctorId'];

    if (doctorIdParam) {
      this.doctorId = Number(doctorIdParam);
    }

    const rebookDoctorName = params['rebookDoctorName'];
    if (rebookDoctorName) {
      this.doctor.update(d => ({
        ...d,
        name: rebookDoctorName,
        specialty: params['rebookSpecialty'] || d.specialty,
        location: params['rebookLocation'] || d.location,
      }));
      this.doctorImage.set(params['rebookImage'] || this.doctorImage());
    }

    const preselectedSlotId = params['slotId'];
    if (preselectedSlotId) {
      this.preselectedSlotId = Number(preselectedSlotId);
    }

    if (this.doctorId) {
      this.save();
      this.loadDoctor(this.doctorId);
      this.loadAvailability(this.doctorId);
      this.loadRatingDistribution(this.doctorId);

    } else if (!rebookDoctorName) {
      this.doctorLoaded.set(true);
      this.errorMessage.set('لم يتم اختيار طبيب. الرجاء العودة واختيار طبيب أولاً.');
    } else {
      this.doctorLoaded.set(true);
    }
  }

  private loadDoctor(id: number): void {
    this.doctorService.getById(id).subscribe({
      next: (d: ApiDoctor) => {
        const name =
          d.name || d.fullName || [d.firstName, d.lastName].filter(Boolean).join(' ') || this.doctor().name;
        this.doctor.update(doc => ({
          ...doc,
          name: name.startsWith('د.') ? name : `د. ${name}`,
          specialty: (d.specialty || d.departmentName || doc.specialty) as string,
          location: (d.address as string) || doc.location,
          price: d.consultationFee ?? doc.price,
          rating: d.rating ?? doc.rating,
          reviewsCount: d.reviewsCount ?? doc.reviewsCount,
        }));
        if (d.imageProfile) this.doctorImage.set(d.imageProfile as string);
        this.doctorLoaded.set(true);
      },
      error: () => {
        this.doctorLoaded.set(true);
        this.errorMessage.set('تعذر تحميل بيانات الطبيب.');
      },
    });
  }
private loadRatingDistribution(doctorId: number): void {
  this.reviewService.getDistribution(doctorId).subscribe({
    next: (res: any) => {
      const dist = res?.data ?? res;
      if (!dist || typeof dist !== 'object') return;
      this.doctor.update((doc) => ({
        ...doc,
        rating: dist.averageRating ?? doc.rating,
        reviewsCount: dist.totalReviews ?? doc.reviewsCount,
      }));
    },
    error: () => {},
  });
}
  private loadAvailability(doctorId: number): void {
    this.isLoading.set(true);
    this.availabilityService.getAvailableByDoctor(doctorId).subscribe({
      next: (slots) => {
        this.allSlots.set(slots || []);
        this.isLoading.set(false);

        if (this.allSlots().length > 0) {
          const first = this.allSlots()[0];
          const d = new Date(first.startTime);
          this.currentYear.set(d.getFullYear());
          this.currentMonthIndex.set(d.getMonth());
          this.selectedDate.set(d.getDate());
        }

        if (this.preselectedSlotId) {
          const match = this.allSlots().find((s) => s.id === this.preselectedSlotId);
          if (match) {
            const d = new Date(match.startTime);
            this.currentYear.set(d.getFullYear());
            this.currentMonthIndex.set(d.getMonth());
            this.selectedDate.set(d.getDate());
            this.selectedSlotId.set(match.id);
            this.selectedTime.set(this.formatTime(match.startTime));
          }
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('تعذر تحميل المواعيد المتاحة لهذا الطبيب.');
      },
    });
  }

  private formatTime(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  prevMonth(): void {
    if (this.currentMonthIndex() === 0) {
      this.currentMonthIndex.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonthIndex.update(m => m - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonthIndex() === 11) {
      this.currentMonthIndex.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonthIndex.update(m => m + 1);
    }
  }

  selectDate(day: CalendarDay | null): void {
    if (!day) return;
    this.selectedDate.set(day.date);
    this.selectedTime.set('');
    this.selectedSlotId.set(null);
    this.save();
  }

  selectTime(slot: TimeSlot): void {
    this.selectedTime.set(slot.label);
    this.selectedSlotId.set(slot.id);
    this.save();
  }

  toggleCountryMenu(): void {
    this.isCountryMenuOpen.update(v => !v);
  }

  selectCountry(country: Country): void {
    this.selectedCountry.set(country);
    this.isCountryMenuOpen.set(false);
    this.save();
  }

  updatePatientField(field: keyof PatientData, value: string | number | null): void {
    this.patient.update(p => ({ ...p, [field]: value }));
    this.save();
  }

  onConfirmBooking(): void {
    if (!this.selectedSlotId()) {
      this.errorMessage.set('من فضلك اختر ميعادًا متاحًا.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.paymentError.set('');

    this.appointmentService
      .book({
        doctorAvailabilityId: this.selectedSlotId()!,
        notes: this.patient().notes || null,
        patientFullName: this.patient().fullName || null,
        patientPhone: (this.selectedCountry().code + this.patient().phone) || null,
        patientGender: this.patient().gender || null,
        patientAge: this.patient().age ?? null,
      })
      .subscribe({
        next: (appointment) => {
          const res = appointment as any;
          this.confirmedAppointmentId.set(res?.data?.id ?? res?.id ?? null);
          this.save();

          if (!this.confirmedAppointmentId()) {
            this.isLoading.set(false);
            this.router.navigate(['/booking/success']);
            return;
          }

          this.initiatePayment();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.error?.message || 'تعذر حجز الموعد، حاول مرة أخرى.');
        },
      });
  }

  retryPayment(): void {
    if (!this.confirmedAppointmentId()) return;
    this.paymentError.set('');
    this.isLoading.set(true);
    this.initiatePayment();
  }

  private initiatePayment(): void {
    this.paymentService.initiate(this.confirmedAppointmentId()!).subscribe({
      next: (paymentRes) => {
        this.isLoading.set(false);
        const redirectUrl = paymentRes?.data?.iframeUrl;
        if (redirectUrl) {
          this.paymentOverlayUrl.set(redirectUrl);
        } else {
          this.paymentError.set('تم الحجز بنجاح لكن تعذر تحميل صفحة الدفع. يمكنك الدفع لاحقاً من ملفك الشخصي.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.paymentError.set(
          'تم الحجز بنجاح لكن تعذر بدء عملية الدفع (' +
          (err?.error?.message || 'خطأ غير معروف') +
          '). يمكنك الدفع لاحقاً من ملفك الشخصي.'
        );
      },
    });
  }

  closePaymentOverlay(): void {
    this.paymentOverlayUrl.set(null);
    this.paymentError.set('');
    this.router.navigate(['/booking/success']);
  }

  skipPayment(): void {
    this.paymentError.set('');
    this.router.navigate(['/booking/success']);
  }

  resetForNewBooking(): void {
    this.doctorLoaded.set(false);
    this.patient.set({
      fullName: '',
      phone: '',
      age: null,
      gender: '',
      notes: '',
    });
    this.selectedCountry.set(COUNTRIES[0]);
    this.selectedSlotId.set(null);
    this.selectedTime.set('');
    this.paymentOverlayUrl.set(null);
    this.paymentError.set('');
    this.confirmedAppointmentId.set(null);
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  }
}
