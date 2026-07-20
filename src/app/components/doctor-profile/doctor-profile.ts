import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';
import { ReviewService } from '../../core/services/review.service';
import { DoctorAvailabilityService } from '../../core/services/doctor-availability.service';
import { Doctor as ApiDoctor } from '../../core/models/doctor.model';
import { Review as ApiReview, DoctorRatingDistribution } from '../../core/models/review.model';
import { DoctorAvailability } from '../../core/models/availability.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { ConversationService } from '../../core/services/conversation.service';

interface Qualification {
  label: string;
}

interface Review {
  patientName: string;
  avatarLetter: string;
  avatarColor: 'purple' | 'cyan';
  rating: number;
  comment: string;
  date: string;
}

interface RatingBar {
  stars: number;
  percent: number;
}

interface TimeSlotOption {
  id: number;
  label: string;
}

type ProfileTab = 'about' | 'reviews';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1200&h=900&fit=crop&q=80';

@Component({
  selector: 'app-doctor-profile',
  imports: [CommonModule],
  templateUrl: './doctor-profile.html',
  styleUrl: './doctor-profile.css',
})
export class DoctorProfile implements OnInit {
  doctorId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private reviewService: ReviewService,
    private availabilityService: DoctorAvailabilityService,
    private appointmentService: AppointmentService,
    private conversationService: ConversationService
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.doctorId = idParam ? Number(idParam) : null;
  }

  isLoading = false;
  errorMessage = '';

  // ================== بيانات الطبيب ==================
  doctor = {
    name: '',
    specialty: '',
    badge: '',
    image: FALLBACK_IMAGE,
    location: '',
    price: 0,
    about: '',
  };

  stats = {
    nextAppointment: '-',
    yearsExperience: '-',
    reviewsCount: 0,
    rating: 0,
  };

  qualifications: Qualification[] = [];

  services: string[] = [];

  timeSlotOptions: TimeSlotOption[] = [];
  availableTimes: string[] = [];
  selectedTime: string | null = null;
  selectedSlotId: number | null = null;

  // ================== التابات ==================
  activeTab: ProfileTab = 'about';

  ratingBasedOnCount = 0;
  averageRating = 0;

  ratingBars: RatingBar[] = [
    { stars: 5, percent: 0 },
    { stars: 4, percent: 0 },
    { stars: 3, percent: 0 },
    { stars: 2, percent: 0 },
    { stars: 1, percent: 0 },
  ];

  reviews: Review[] = [];

  ngOnInit(): void {
    if (!this.doctorId) {
      this.errorMessage = 'رقم الطبيب غير صحيح.';
      return;
    }
    this.loadDoctor(this.doctorId);
    this.loadDistribution(this.doctorId);
    this.loadReviews(this.doctorId);
    this.loadAvailability(this.doctorId);
    this.checkPreviousAppointments(this.doctorId);
  }

  private loadDoctor(id: number): void {
    this.isLoading = true;
    // نداء API: GET /api/Doctor/{id}
    this.doctorService.getById(id).subscribe({
      next: (d: ApiDoctor) => {
        const name =
          d.name || d.fullName || [d.firstName, d.lastName].filter(Boolean).join(' ') || 'طبيب';
        this.doctor = {
          name: name.startsWith('د.') ? name : `د. ${name}`,
          specialty: (d.specialty || d.departmentName || 'طبيب عام') as string,
          badge: (d.departmentName || d.specialty || '') as string,
          image: (d.imageProfile as string) || FALLBACK_IMAGE,
          location: (d.address as string) || 'غير محدد',
          price: d.consultationFee ?? 0,
          about: (d.about as string) || '',
        };
        this.stats.rating = d.rating ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'تعذر تحميل بيانات الطبيب.';
        this.isLoading = false;
      },
    });
  }

  private loadReviews(doctorId: number): void {
    // نداء API: GET /api/Reviews/doctors/{doctorId}
    this.reviewService.getByDoctor(doctorId).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res?.reviews) ? res.reviews
                   : Array.isArray(res?.data?.reviews) ? res.data.reviews
                   : Array.isArray(res?.data) ? res.data
                   : Array.isArray(res) ? res
                   : [];
        this.reviews = list.map((r: ApiReview) => ({
          patientName: r.patientName || 'مريض',
          avatarLetter: (r.patientName || 'م').charAt(0),
          avatarColor: (r.id ?? 0) % 2 === 0 ? 'purple' : 'cyan',
          rating: r.rating,
          comment: r.comment || '',
          date: r.reviewDate || r.createdAt || '',
        }));
      },
      error: () => {
        // مفيش تقييمات أو فشل التحميل - بنسيب القايمة فاضية بدون ما نوقف باقي الصفحة
      },
    });
  }

  private loadDistribution(doctorId: number): void {
    this.reviewService.getDistribution(doctorId).subscribe({
      next: (res: any) => {
        const dist = res?.data ?? res;
        if (!dist || typeof dist !== 'object') return;

        const total = dist.totalReviews || 0;
        this.stats.reviewsCount = total;
        this.ratingBasedOnCount = total;
        this.averageRating = dist.averageRating;

        if (total === 0) return;

        const counts = [dist.oneStar, dist.twoStar, dist.threeStar, dist.fourStar, dist.fiveStar];

        this.ratingBars = [5, 4, 3, 2, 1].map((stars) => ({
          stars,
          percent: Math.round((counts[stars - 1] / total) * 100),
        }));
      },
      error: () => {
        // فشل تحميل التوزيع - بنسيب القيم الافتراضية
      },
    });
  }

  private loadAvailability(doctorId: number): void {
    // نداء API: GET /api/DoctorAvailability/doctor/{doctorId}/available
    this.availabilityService.getAvailableByDoctor(doctorId).subscribe({
      next: (slots: DoctorAvailability[]) => {
        this.timeSlotOptions = (slots || []).map((s) => ({
          id: s.id,
          label: this.formatTime(s.startTime),
        }));
        this.availableTimes = Array.from(new Set(this.timeSlotOptions.map((s) => s.label)));
        if (this.timeSlotOptions.length > 0) {
          this.stats.nextAppointment = this.timeSlotOptions[0].label;
        }
      },
      error: () => {
        // لا توجد مواعيد متاحة حاليًا
      },
    });
  }

  private formatTime(iso: string): string {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  setActiveTab(tab: ProfileTab): void {
    this.activeTab = tab;
  }

  selectTime(time: string): void {
    this.selectedTime = time;
    const option = this.timeSlotOptions.find((t) => t.label === time);
    this.selectedSlotId = option ? option.id : null;
  }

  onBack(): void {
    this.router.navigate(['/doctors']);
  }

  // ================== استشارة الطبيب ==================

  consultPopupOpen = false;
  hasPreviousAppointment = false;
  isLoadingConsult = false;

  private checkPreviousAppointments(doctorId: number): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (appointments) => {
        this.hasPreviousAppointment = (appointments || []).some(
          (app) => Number(app.doctorId) === Number(doctorId) && app.status !== 'Cancelled'
        );
      },
      error: (err) => console.error('Error checking appointments:', err)
    });
  }

  onConsultDoctor(): void {
    if (this.hasPreviousAppointment) {
      if (!this.doctorId || this.isLoadingConsult) return;
      this.isLoadingConsult = true;

      this.conversationService.startAsPatient(this.doctorId).subscribe({
        next: (conversation) => {
          this.isLoadingConsult = false;
          if (conversation && conversation.id) {
            this.router.navigate(['/chat'], {
              queryParams: {
                conversationId: conversation.id,
                doctorId: this.doctorId,
                name: this.doctor.name,
                specialty: this.doctor.specialty,
                image: this.doctor.image,
              },
            });
          }
        },
        error: (err) => {
          this.isLoadingConsult = false;
          console.error('Error starting conversation:', err);
        }
      });
    } else {
      this.consultPopupOpen = true;
    }
  }

  onDismissConsultPopup(): void {
    this.consultPopupOpen = false;
  }

  onBookFromConsultPopup(): void {
    this.consultPopupOpen = false;
    this.router.navigate(['/booking'], {
      queryParams: {
        fromConsult: 'true',
        doctorId: this.doctorId,
        rebookDoctorName: this.doctor.name,
        rebookSpecialty: this.doctor.specialty,
        rebookLocation: this.doctor.location,
        rebookImage: this.doctor.image,
      },
    });
  }

  onBookAppointment(): void {
    this.router.navigate(['/booking'], {
      queryParams: {
        doctorId: this.doctorId,
        slotId: this.selectedSlotId,
      },
    });
  }

  onChatDoctor(): void {
    this.router.navigate(['/chat'], {
      queryParams: {
        doctorId: this.doctorId,
        name: this.doctor.name,
        specialty: this.doctor.specialty,
        image: this.doctor.image,
      },
    });
  }
}
