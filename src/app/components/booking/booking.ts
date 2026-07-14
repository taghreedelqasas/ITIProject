import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';
import { DoctorAvailabilityService } from '../../core/services/doctor-availability.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { PaymentService } from '../../core/services/payment.service';
import { Doctor as ApiDoctor } from '../../core/models/doctor.model';
import { DoctorAvailability } from '../../core/models/availability.model';

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
}

interface TimeSlot {
  id: number;
  label: string;
}

interface BookingStep {
  num: number;
  label: string;
}

interface Country {
  code: string;   // كود الدولة الدولي مثل +20
  flag: string;   // إيموجي العلم
  name: string;
}

interface PatientData {
  fullName: string;
  phone: string;
  age: number | null;
  gender: string;
  notes: string;
}

type PaymentMethod = 'card' | 'wallet' | null;

interface CardData {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
  saveCard: boolean;
}

const FALLBACK_IMAGE = 'doctor_photo.png';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {
  // لو المستخدم جه من زرار "إعادة الحجز" في صفحة مواعيده، بيتحفظ رقم الموعد القديم هنا
  rebookId: string | null = null;

  // لو المستخدم جه من بوب أب "لازم تحجز موعد الأول" في شاشة إستشارة الطبيب
  fromConsultFlow = false;

  doctorId: number | null = null;

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private availabilityService: DoctorAvailabilityService,
    private appointmentService: AppointmentService,
    private paymentService: PaymentService
  ) {
    const params = this.route.snapshot.queryParamMap;
    this.rebookId = params.get('rebookId');
    this.fromConsultFlow = params.get('fromConsult') === 'true';

    const doctorIdParam = params.get('doctorId');
    this.doctorId = doctorIdParam ? Number(doctorIdParam) : null;

    // لو جايين من "إعادة الحجز"، بنعرض بيانات نفس الطبيب اللي كان محجوز معاه قبل كده
    const rebookDoctorName = params.get('rebookDoctorName');
    if (rebookDoctorName) {
      this.doctor.name = rebookDoctorName;
      this.doctor.specialty = params.get('rebookSpecialty') || this.doctor.specialty;
      this.doctor.location = params.get('rebookLocation') || this.doctor.location;
      this.doctorImage = params.get('rebookImage') || this.doctorImage;
    }

    const preselectedSlotId = params.get('slotId');
    this.preselectedSlotId = preselectedSlotId ? Number(preselectedSlotId) : null;
  }

  ngOnInit(): void {
    if (this.doctorId) {
      this.loadDoctor(this.doctorId);
      this.loadAvailability(this.doctorId);
    }
  }

  pageTitle = 'حجز موعد';
  pageSubtitle = 'إحجز موعدك بكل سهولة مع موعد';

  // خطوات الحجز (بترتيب RTL: التأكيد يظهر أول حاجة على الشمال، والخطوة الحالية على اليمين)
  steps: BookingStep[] = [
    { num: 4, label: 'التأكيد' },
    { num: 3, label: 'الدفع' },
    { num: 2, label: 'بيانات المريض' },
    { num: 1, label: 'التاريخ والوقت' },
  ];
  currentStep = 1;

  // بيانات الطبيب - هتتحدث من الـ API لو فيه doctorId في الرابط
  doctor = {
    name: 'د. سارة إبراهيم',
    specialty: 'طب العظام - إستشارية جراحة العظام',
    location: 'المنصورة، حي الجامعة',
    rating: 4.8,
    reviewsCount: 100,
    price: 300,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara&backgroundColor=ffd5dc',
  };

  // صورة الطبيب المعروضة في كارت الحجز (بتتغير لو المستخدم جاي من "إعادة الحجز")
  doctorImage = FALLBACK_IMAGE;

  private loadDoctor(id: number): void {
    // نداء API: GET /api/Doctor/{id}
    this.doctorService.getById(id).subscribe({
      next: (d: ApiDoctor) => {
        const name =
          d.name || d.fullName || [d.firstName, d.lastName].filter(Boolean).join(' ') || this.doctor.name;
        this.doctor = {
          ...this.doctor,
          name: name.startsWith('د.') ? name : `د. ${name}`,
          specialty: (d.specialty || d.departmentName || this.doctor.specialty) as string,
          location: (d.address as string) || this.doctor.location,
          price: d.consultationFee ?? this.doctor.price,
          rating: d.rating ?? this.doctor.rating,
        };
        if (d.imageProfile) this.doctorImage = d.imageProfile as string;
      },
      error: () => {
        // نسيب البيانات الافتراضية لو فشل التحميل
      },
    });
  }

  // ================== الأوقات المتاحة (من الـ API) ==================

  private allSlots: DoctorAvailability[] = [];
  private preselectedSlotId: number | null = null;
  selectedSlotId: number | null = null;

  private loadAvailability(doctorId: number): void {
    this.isLoading = true;
    // نداء API: GET /api/DoctorAvailability/doctor/{doctorId}/available
    this.availabilityService.getAvailableByDoctor(doctorId).subscribe({
      next: (slots) => {
        this.allSlots = slots || [];
        this.isLoading = false;

        if (this.allSlots.length > 0) {
          const first = this.allSlots[0];
          const d = new Date(first.startTime);
          this.currentYear = d.getFullYear();
          this.currentMonthIndex = d.getMonth();
          this.selectedDate = d.getDate();
        }

        if (this.preselectedSlotId) {
          const match = this.allSlots.find((s) => s.id === this.preselectedSlotId);
          if (match) {
            const d = new Date(match.startTime);
            this.currentYear = d.getFullYear();
            this.currentMonthIndex = d.getMonth();
            this.selectedDate = d.getDate();
            this.selectedSlotId = match.id;
            this.selectedTime = this.formatTime(match.startTime);
          }
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'تعذر تحميل المواعيد المتاحة لهذا الطبيب.';
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

  // أسماء الأشهر والأيام بالعربي
  monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];

  weekDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  currentYear = new Date().getFullYear();
  currentMonthIndex = new Date().getMonth();
  selectedDate = new Date().getDate();

  selectedTime = '';

  get monthLabel(): string {
    return `${this.monthNames[this.currentMonthIndex]} ${this.currentYear}`;
  }

  get calendarDays(): (CalendarDay | null)[] {
    const firstOfMonth = new Date(this.currentYear, this.currentMonthIndex, 1);
    const daysInMonth = new Date(this.currentYear, this.currentMonthIndex + 1, 0).getDate();
    const startWeekday = firstOfMonth.getDay(); // 0 = أحد

    const cells: (CalendarDay | null)[] = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: d, isCurrentMonth: true });
    }
    return cells;
  }

  // الأوقات المتاحة لليوم المختار فقط، مقسمة لصفوف من 4 عشان تتوافق مع تصميم الجدول الحالي
  get timeSlots(): TimeSlot[][] {
    const slotsForDay = this.allSlots.filter((s) => {
      const d = new Date(s.startTime);
      return (
        d.getFullYear() === this.currentYear &&
        d.getMonth() === this.currentMonthIndex &&
        d.getDate() === this.selectedDate
      );
    });

    const mapped: TimeSlot[] = slotsForDay.map((s) => ({ id: s.id, label: this.formatTime(s.startTime) }));

    const rows: TimeSlot[][] = [];
    for (let i = 0; i < mapped.length; i += 4) {
      rows.push(mapped.slice(i, i + 4));
    }
    return rows;
  }

  prevMonth(): void {
    if (this.currentMonthIndex === 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    } else {
      this.currentMonthIndex--;
    }
  }

  nextMonth(): void {
    if (this.currentMonthIndex === 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    } else {
      this.currentMonthIndex++;
    }
  }

  selectDate(day: CalendarDay | null): void {
    if (!day) return;
    this.selectedDate = day.date;
    this.selectedTime = '';
    this.selectedSlotId = null;
  }

  selectTime(slot: TimeSlot): void {
    this.selectedTime = slot.label;
    this.selectedSlotId = slot.id;
  }

  onNext(): void {
    if (!this.selectedSlotId) {
      this.errorMessage = 'من فضلك اختر ميعادًا متاحًا أولًا.';
      return;
    }
    this.errorMessage = '';
    this.goToStep(2);
  }

  // ================== خطوة بيانات المريض ==================

  countries: Country[] = [
    { code: '+20', flag: '🇪🇬', name: 'مصر' },
    { code: '+966', flag: '🇸🇦', name: 'السعودية' },
    { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
    { code: '+965', flag: '🇰🇼', name: 'الكويت' },
    { code: '+962', flag: '🇯🇴', name: 'الأردن' },
  ];
  selectedCountry: Country = this.countries[0];
  isCountryMenuOpen = false;

  patient: PatientData = {
    fullName: '',
    phone: '',
    age: null,
    gender: '',
    notes: '',
  };

  toggleCountryMenu(): void {
    this.isCountryMenuOpen = !this.isCountryMenuOpen;
  }

  selectCountry(country: Country): void {
    this.selectedCountry = country;
    this.isCountryMenuOpen = false;
  }

  get isPatientFormValid(): boolean {
    return this.patient.fullName.trim().length > 0 && this.patient.phone.trim().length > 0;
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  onBackToDateTime(): void {
    this.goToStep(1);
  }

  onSubmitPatientData(): void {
    if (!this.isPatientFormValid) return;
    this.goToStep(3);
  }

  // ================== خطوة الدفع ==================

  selectedPaymentMethod: PaymentMethod = null;

  card: CardData = {
    number: '',
    holderName: '',
    expiry: '',
    cvv: '',
    saveCard: false,
  };

  walletPhone = '';

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
  }

  get isPaymentValid(): boolean {
    if (this.selectedPaymentMethod === 'wallet') {
      return this.walletPhone.trim().length > 0;
    }
    if (this.selectedPaymentMethod === 'card') {
      return (
        this.card.number.trim().length > 0 &&
        this.card.holderName.trim().length > 0 &&
        this.card.expiry.trim().length > 0 &&
        this.card.cvv.trim().length > 0
      );
    }
    return false;
  }

  onBackToPatientData(): void {
    this.goToStep(2);
  }

  onSubmitPayment(): void {
    if (!this.isPaymentValid) return;
    this.goToStep(4);
  }

  // ================== خطوة المراجعة والتأكيد ==================

  get selectedDateLabel(): string {
    return `${this.selectedDate} ${this.monthNames[this.currentMonthIndex]} ${this.currentYear}`;
  }

  get genderLabel(): string {
    if (this.patient.gender === 'male') return 'ذكر';
    if (this.patient.gender === 'female') return 'أنثى';
    return '-';
  }

  get paymentMethodLabel(): string {
    if (this.selectedPaymentMethod === 'card') return 'بطاقة إئتمانية';
    if (this.selectedPaymentMethod === 'wallet') return 'محفظة إلكترونية';
    return '-';
  }

  get fullPhoneNumber(): string {
    return this.patient.phone ? `${this.patient.phone}` : '-';
  }

  onBackToPayment(): void {
    this.goToStep(3);
  }

  confirmedAppointmentId: number | null = null;

  onConfirmBooking(): void {
    if (!this.selectedSlotId) {
      this.errorMessage = 'من فضلك اختر ميعادًا متاحًا.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // نداء API: POST /api/Appointments لحجز الموعد فعليًا
    this.appointmentService
      .book({ doctorAvailabilityId: this.selectedSlotId, notes: this.patient.notes || null })
      .subscribe({
        next: (appointment) => {
          this.confirmedAppointmentId = (appointment?.id as number) ?? null;

          if (!this.confirmedAppointmentId) {
            this.isLoading = false;
            this.goToStep(5);
            return;
          }

          // نداء API: POST /api/payments/initiate/{appointmentId} لبدء عملية الدفع (Paymob)
          this.paymentService.initiate(this.confirmedAppointmentId).subscribe({
            next: (paymentRes) => {
              this.isLoading = false;
              const redirectUrl = paymentRes?.iframeUrl || paymentRes?.paymentUrl;
              if (redirectUrl && typeof window !== 'undefined') {
                window.open(redirectUrl as string, '_blank');
              }
              this.goToStep(5);
            },
            error: () => {
              // الحجز اتعمل بنجاح حتى لو فشل بدء الدفع - المستخدم يقدر يدفع لاحقًا من صفحة مواعيده
              this.isLoading = false;
              this.goToStep(5);
            },
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'تعذر حجز الموعد، حاول مرة أخرى.';
        },
      });
  }

  // ================== خطوة 5: تم تأكيد الحجز ==================

  onBackToHome(): void {
    if (this.rebookId) {
      // يرجع لصفحة "مواعيدي" مع بيانات الموعد الجديد عشان يتضاف فعليًا في "المواعيد القادمة"
      this.router.navigate(['/profile'], {
        queryParams: {
          rebookSuccess: this.rebookId,
          rebookDoctorName: this.doctor.name,
          rebookSpecialty: this.doctor.specialty,
          rebookImage: this.doctorImage,
          rebookLocation: this.doctor.location,
          rebookDate: this.selectedDateLabel,
          rebookTime: this.selectedTime,
        },
      });
    } else {
      this.router.navigate(['/profile']);
    }
  }

  onGoToConsult(): void {
    this.router.navigate(['/consult'], {
      queryParams: {
        doctorId: this.doctorId,
        doctorName: this.doctor.name,
        specialty: this.doctor.specialty,
        location: this.doctor.location,
        image: this.doctorImage,
        rating: this.doctor.rating,
        reviewsCount: this.doctor.reviewsCount,
      },
    });
  }

  onBookAnotherAppointment(): void {
    // إعادة تعيين بيانات الحجز للبدء من جديد
    this.patient = {
      fullName: '',
      phone: '',
      age: null,
      gender: '',
      notes: '',
    };
    this.selectedCountry = this.countries[0];
    this.selectedPaymentMethod = null;
    this.walletPhone = '';
    this.card = {
      number: '',
      holderName: '',
      expiry: '',
      cvv: '',
      saveCard: false,
    };
    this.selectedSlotId = null;
    this.selectedTime = '';
    this.goToStep(1);
  }
}
