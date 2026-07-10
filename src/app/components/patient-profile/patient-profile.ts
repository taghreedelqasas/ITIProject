import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { ReviewService } from '../../core/services/review.service';
import { DoctorAvailabilityService } from '../../core/services/doctor-availability.service';
import { Appointment as ApiAppointment } from '../../core/models/appointment.model';
import { DoctorAvailability } from '../../core/models/availability.model';

type ProfileTab =
  | 'personal-info'
  | 'medical-file'
  | 'appointments'
  | 'favorites'
  | 'reviews'
  | 'settings';

interface UpcomingAppointment {
  id: number;
  doctorId?: number;
  doctorName: string;
  specialty: string;
  image: string;
  date: string;
  time: string;
  location: string;
  editable: boolean;
  recentlyUpdated?: boolean;
  justBooked?: boolean;
}

interface PastAppointment {
  id: number;
  doctorId?: number;
  doctorName: string;
  specialty: string;
  image: string;
  date: string;
  time: string;
  location?: string;
  rated: boolean;
  rebooked?: boolean;
  draftStars?: number;
  draftComment?: string;
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
}

interface TimeSlot {
  id?: number;
  label: string;
}

type AppointmentsView = 'list' | 'reschedule';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=200&h=200&fit=crop&q=80';

@Component({
  selector: 'app-patient-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.css',
})
export class PatientProfile implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private reviewService: ReviewService,
    private availabilityService: DoctorAvailabilityService
  ) {}

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    // نداء API: GET /api/Appointments/my لتحميل مواعيد المريض الحقيقية
    this.loadAppointments();

    // لو المستخدم راجع من صفحة الحجز بعد ما كمّل "إعادة حجز" بنجاح
    this.route.queryParams.subscribe((params) => {
      const rebookSuccessId = params['rebookSuccess'];
      if (rebookSuccessId) {
        const id = Number(rebookSuccessId);

        // بنعلّم الموعد القديم إنه اتحجز تاني
        this.pastAppointments = this.pastAppointments.map((a) =>
          a.id === id ? { ...a, rebooked: true } : a
        );

        // وبنضيف كارت جديد فعلي في قسم "المواعيد القادمة" ببيانات الموعد المحجوز
        const date = params['rebookDate'];
        const time = params['rebookTime'];
        const doctorName = params['rebookDoctorName'];

        if (date && time && doctorName) {
          const newId =
            this.upcomingAppointments.length > 0
              ? Math.max(...this.upcomingAppointments.map((a) => a.id)) + 1
              : 1;

          const originalPast = this.pastAppointments.find((a) => a.id === id);

          this.upcomingAppointments = [
            {
              id: newId,
              doctorName,
              specialty: params['rebookSpecialty'] || originalPast?.specialty || '',
              image: params['rebookImage'] || originalPast?.image || '',
              date,
              time,
              location:
                params['rebookLocation'] || originalPast?.location || 'العيادة الرئيسية',
              editable: true,
              justBooked: true,
            },
            ...this.upcomingAppointments,
          ];

          this.upcomingSectionOpen = true;
        }

        this.appointmentsView = 'list';
        // تنظيف الرابط من الـ query params عشان الرسالة ما تفضلش تظهر تاني لو المستخدم عمل refresh
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }
    });
  }

  // ================== بيانات المريض ==================
  patient = {
    name: 'يونس أحمد',
    image:
      'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=300&h=300&fit=crop&q=80',
  };

  // ================== التابات ==================
  activeTab: ProfileTab = 'appointments';

  setActiveTab(tab: ProfileTab): void {
    this.activeTab = tab;
    this.appointmentsView = 'list';
  }

  // ================== طي/فتح الأقسام ==================
  upcomingSectionOpen = true;
  pastSectionOpen = true;

  toggleUpcomingSection(): void {
    this.upcomingSectionOpen = !this.upcomingSectionOpen;
  }

  togglePastSection(): void {
    this.pastSectionOpen = !this.pastSectionOpen;
  }

  // ================== المواعيد (من الـ API) ==================
  upcomingAppointments: UpcomingAppointment[] = [];
  pastAppointments: PastAppointment[] = [];

  private mapAppointment(a: ApiAppointment): UpcomingAppointment & PastAppointment {
    const startTime = (a.startTime as string) || (a.date as string) || '';
    let dateLabel = a.date || '';
    let timeLabel = a.time || '';
    if (startTime && !a.date) {
      try {
        const d = new Date(startTime);
        dateLabel = d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        timeLabel = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      } catch {
        /* تجاهل خطأ تحويل التاريخ */
      }
    }

    return {
      id: a.id,
      doctorId: a.doctorId,
      doctorName: a.doctorName
        ? a.doctorName.startsWith('د.')
          ? a.doctorName
          : `د. ${a.doctorName}`
        : 'الطبيب',
      specialty: a.doctorSpecialty || '',
      image: a.doctorImage || FALLBACK_IMAGE,
      date: dateLabel,
      time: timeLabel,
      location: a.location || 'العيادة الرئيسية',
      editable: a.status === 'Pending' || a.status === 'Confirmed',
      rated: false,
    };
  }

  private loadAppointments(): void {
    this.isLoading = true;
    // نداء API: GET /api/Appointments/my
    this.appointmentService.getMyAppointments().subscribe({
      next: (list) => {
        const mapped = (list || []).map((a) => this.mapAppointment(a));

        this.upcomingAppointments = mapped.filter((a) => {
          const status = list.find((x) => x.id === a.id)?.status;
          return status !== 'Completed' && status !== 'Cancelled';
        });

        this.pastAppointments = mapped
          .filter((a) => list.find((x) => x.id === a.id)?.status === 'Completed')
          .map((a) => ({ ...a, rated: false }));

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'تعذر تحميل مواعيدك حاليًا.';
        this.isLoading = false;
      },
    });
  }

  // ================== إجراءات المواعيد القادمة ==================

  onEditAppointment(appointment: UpcomingAppointment): void {
    if (!appointment.editable) return;

    // تفتح شاشة "تعديل الموعد" (اختيار التاريخ والوقت) لنفس الموعد القائم
    this.editingAppointment = appointment;
    this.rescheduleSectionOpen = true;
    this.appointmentsView = 'reschedule';

    if (appointment.doctorId) {
      this.loadRescheduleSlots(appointment.doctorId);
    } else {
      this.prefillCalendarFromAppointment(appointment);
    }
  }

  onCancelAppointment(appointment: UpcomingAppointment): void {
    if (!appointment.editable) return;
    // بدل ما نلغي على طول، بنفتح بوب أب تأكيد الإلغاء
    this.appointmentPendingCancel = appointment;
    this.cancelPopupOpen = true;
  }

  onDismissCancelPopup(): void {
    this.cancelPopupOpen = false;
    this.appointmentPendingCancel = null;
  }

  onConfirmCancelAppointment(): void {
    if (!this.appointmentPendingCancel) return;
    const cancelledId = this.appointmentPendingCancel.id;

    // نداء API: DELETE /api/Appointments/{id}/cancel
    this.appointmentService.cancel(cancelledId).subscribe({
      next: () => {
        this.upcomingAppointments = this.upcomingAppointments.filter((a) => a.id !== cancelledId);
        this.cancelPopupOpen = false;
        this.appointmentPendingCancel = null;
      },
      error: () => {
        this.errorMessage = 'تعذر إلغاء الموعد، حاول مرة أخرى.';
        this.cancelPopupOpen = false;
        this.appointmentPendingCancel = null;
      },
    });
  }

  // ================== بوب أب تأكيد إلغاء الموعد ==================

  cancelPopupOpen = false;
  appointmentPendingCancel: UpcomingAppointment | null = null;

  // ================== إجراءات المواعيد السابقة ==================

  onRebookAppointment(appointment: PastAppointment): void {
    // تنتقل بالمستخدم لفلو الحجز الكامل (خطوات التاريخ، البيانات، الدفع، والتأكيد)
    // وبتبعت بيانات الطبيب عشان تفضل معاه طول الرحلة ولحد ما يرجع تاني هنا
    this.router.navigate(['/booking'], {
      queryParams: {
        rebookId: appointment.id,
        doctorId: appointment.doctorId,
        rebookDoctorName: appointment.doctorName,
        rebookSpecialty: appointment.specialty,
        rebookImage: appointment.image,
        rebookLocation: appointment.location || 'العيادة الرئيسية',
      },
    });
  }

  onRateDoctor(appointment: PastAppointment): void {
    if (appointment.rated) return;
    this.ratingAppointment = appointment;
    this.ratingStars = 0;
    this.ratingPopupOpen = true;
  }

  // ================== نافذة تقييم الطبيب ==================

  ratingPopupOpen = false;
  ratingAppointment: PastAppointment | null = null;
  ratingStars = 0;
  ratingStarsArray = [1, 2, 3, 4, 5];

  setRatingStars(stars: number): void {
    this.ratingStars = stars;
  }

  onCancelRating(): void {
    this.ratingPopupOpen = false;
    this.ratingAppointment = null;
    this.ratingStars = 0;
  }

  onSubmitRating(): void {
    if (!this.ratingAppointment || !this.ratingStars || !this.ratingAppointment.doctorId) return;

    const ratedId = this.ratingAppointment.id;
    const doctorId = this.ratingAppointment.doctorId;

    // نداء API: POST /api/Reviews
    this.reviewService.create({ doctorId, rating: this.ratingStars }).subscribe({
      next: () => {
        this.pastAppointments = this.pastAppointments.map((a) =>
          a.id === ratedId ? { ...a, rated: true } : a
        );
        this.ratingPopupOpen = false;
        this.ratingAppointment = null;
        this.ratingStars = 0;
      },
      error: () => {
        this.errorMessage = 'تعذر إرسال تقييمك، حاول مرة أخرى.';
      },
    });
  }

  // ================== تاب التقييمات ==================

  get unratedPastAppointments(): PastAppointment[] {
    return this.pastAppointments.filter((a) => !a.rated);
  }

  setDoctorDraftStars(appointment: PastAppointment, stars: number): void {
    appointment.draftStars = stars;
  }

  submitDoctorReview(appointment: PastAppointment): void {
    if (!appointment.draftStars || !appointment.doctorId) return;

    // نداء API: POST /api/Reviews
    this.reviewService
      .create({
        doctorId: appointment.doctorId,
        rating: appointment.draftStars,
        comment: appointment.draftComment || null,
      })
      .subscribe({
        next: () => {
          this.pastAppointments = this.pastAppointments.map((a) =>
            a.id === appointment.id ? { ...a, rated: true } : a
          );
          this.showSuccessPopup('تم إرسال تقييمك للطبيب بنجاح');
        },
        error: () => {
          this.errorMessage = 'تعذر إرسال تقييمك، حاول مرة أخرى.';
        },
      });
  }

  platformRatingStars = 0;
  platformRatingComment = '';

  setPlatformRatingStars(stars: number): void {
    this.platformRatingStars = stars;
  }

  submitPlatformRating(): void {
    if (!this.platformRatingStars) return;

    // ملحوظة: لا يوجد Endpoint مخصص لتقييم المنصة نفسها في الـ API الحالي،
    // فبنكتفي بعرض رسالة الشكر محليًا لحد ما يتضاف Endpoint مخصص لذلك.
    this.platformRatingStars = 0;
    this.platformRatingComment = '';

    this.showSuccessPopup('شكراً لك! تم إرسال تقييمك لمنصة موعد بنجاح');
  }

  // ================== بوب أب نجاح عام ==================

  successPopupOpen = false;
  successPopupMessage = '';

  showSuccessPopup(message: string): void {
    this.successPopupMessage = message;
    this.successPopupOpen = true;
  }

  closeSuccessPopup(): void {
    this.successPopupOpen = false;
    this.successPopupMessage = '';
  }

  // ================== شاشة تعديل الموعد ==================

  appointmentsView: AppointmentsView = 'list';
  editingAppointment: UpcomingAppointment | null = null;
  rescheduleSectionOpen = true;

  monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];

  weekDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  currentYear = 2026;
  currentMonthIndex = 5; // يونيو (0-indexed)
  selectedDate = 11;

  private rescheduleSlots: DoctorAvailability[] = [];
  selectedSlotId: number | null = null;

  timeSlots: TimeSlot[][] = [
    [{ label: '09:00 ص' }, { label: '09:30 ص' }, { label: '10:00 ص' }, { label: '11:30 ص' }],
    [{ label: '01:00 م' }, { label: '02:30 م' }, { label: '04:00 م' }, { label: '05:30 م' }],
  ];
  selectedTime = '10:00 ص';

  private loadRescheduleSlots(doctorId: number): void {
    // نداء API: GET /api/DoctorAvailability/doctor/{doctorId}/available
    this.availabilityService.getAvailableByDoctor(doctorId).subscribe({
      next: (slots) => {
        this.rescheduleSlots = slots || [];
        if (this.rescheduleSlots.length > 0) {
          const d = new Date(this.rescheduleSlots[0].startTime);
          this.currentYear = d.getFullYear();
          this.currentMonthIndex = d.getMonth();
          this.selectedDate = d.getDate();
          this.recomputeTimeSlotsForSelectedDate();
        }
      },
      error: () => {
        this.rescheduleSlots = [];
      },
    });
  }

  private recomputeTimeSlotsForSelectedDate(): void {
    if (this.rescheduleSlots.length === 0) return;

    const slotsForDay = this.rescheduleSlots.filter((s) => {
      const d = new Date(s.startTime);
      return (
        d.getFullYear() === this.currentYear &&
        d.getMonth() === this.currentMonthIndex &&
        d.getDate() === this.selectedDate
      );
    });

    const mapped: TimeSlot[] = slotsForDay.map((s) => ({
      id: s.id,
      label: new Date(s.startTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    }));

    const rows: TimeSlot[][] = [];
    for (let i = 0; i < mapped.length; i += 4) {
      rows.push(mapped.slice(i, i + 4));
    }
    this.timeSlots = rows;
  }

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

  toggleRescheduleSection(): void {
    this.rescheduleSectionOpen = !this.rescheduleSectionOpen;
  }

  prevMonth(): void {
    if (this.currentMonthIndex === 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    } else {
      this.currentMonthIndex--;
    }
    if (this.rescheduleSlots.length > 0) this.recomputeTimeSlotsForSelectedDate();
  }

  nextMonth(): void {
    if (this.currentMonthIndex === 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    } else {
      this.currentMonthIndex++;
    }
    if (this.rescheduleSlots.length > 0) this.recomputeTimeSlotsForSelectedDate();
  }

  selectDate(day: CalendarDay | null): void {
    if (!day) return;
    this.selectedDate = day.date;
    this.selectedSlotId = null;
    if (this.rescheduleSlots.length > 0) this.recomputeTimeSlotsForSelectedDate();
  }

  selectTime(slot: TimeSlot): void {
    this.selectedTime = slot.label;
    this.selectedSlotId = slot.id ?? null;
  }

  get selectedDateLabel(): string {
    return `${this.currentYear} ${this.monthNames[this.currentMonthIndex]} ${this.selectedDate}`;
  }

  private prefillCalendarFromAppointment(appointment: UpcomingAppointment): void {
    // بيانات الموعد الحالي محفوظة بصيغة "2026 يونيو 20"
    const parts = appointment.date.split(' ');
    const year = Number(parts[0]);
    const monthIndex = this.monthNames.indexOf(parts[1]);
    const day = Number(parts[2]);

    this.currentYear = !isNaN(year) ? year : 2026;
    this.currentMonthIndex = monthIndex !== -1 ? monthIndex : 5;
    this.selectedDate = !isNaN(day) ? day : 11;
    this.selectedTime = appointment.time || '10:00 ص';
  }

  onCancelReschedule(): void {
    this.editingAppointment = null;
    this.appointmentsView = 'list';
  }

  onConfirmReschedule(): void {
    if (!this.editingAppointment) return;

    const updatedDate = this.selectedDateLabel;
    const updatedTime = this.selectedTime;
    const editedId = this.editingAppointment.id;

    if (!this.selectedSlotId) {
      // مفيش بيانات فعلية من الـ API (مثلاً الطبيب مالوش doctorId)، فبنكتفي بالتحديث المحلي كما كان
      this.upcomingAppointments = this.upcomingAppointments.map((a) =>
        a.id === editedId
          ? { ...a, date: updatedDate, time: updatedTime, recentlyUpdated: true }
          : a
      );
      this.editingAppointment = null;
      this.appointmentsView = 'list';
      return;
    }

    // نداء API: PUT /api/Appointments/{id}/reschedule
    this.appointmentService
      .reschedule(editedId, { newDoctorAvailabilityId: this.selectedSlotId })
      .subscribe({
        next: () => {
          this.upcomingAppointments = this.upcomingAppointments.map((a) =>
            a.id === editedId
              ? { ...a, date: updatedDate, time: updatedTime, recentlyUpdated: true }
              : a
          );
          this.editingAppointment = null;
          this.appointmentsView = 'list';
        },
        error: () => {
          this.errorMessage = 'تعذر تعديل الموعد، حاول مرة أخرى.';
        },
      });
  }
}
