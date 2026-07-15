import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { ReviewService } from '../../core/services/review.service';
import { Appointment } from '../../core/models/appointment.model';
import { Review } from '../../core/models/review.model';
import { DoctorReviewCardComponent } from '../doctor-review-card-component/doctor-review-card-component';

@Component({
  selector: 'app-ratings-page',
  standalone: true,
  imports: [CommonModule,DoctorReviewCardComponent],
  templateUrl: './ratings-page-component.html',
  styleUrl: './ratings-page-component.css',
})
export class RatingsPageComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private reviewService = inject(ReviewService);

  loading = signal(true);
  errorMsg = signal<string | null>(null);

  appointments = signal<Appointment[]>([]);
  myReviews = signal<Review[]>([]);

  // الأطباء اللي المريض خلص عندهم موعد ومسموحلها تقيمهم (موعد واحد لكل طبيب يكفي عشان يظهر الكارت)
  reviewableAppointments = computed(() => {
    const seenDoctors = new Set<number>();
    const list: Appointment[] = [];

    for (const appt of this.appointments()) {
      if ((appt.status || '').toLowerCase() !== 'completed') continue;
      if (!appt.doctorId || seenDoctors.has(appt.doctorId)) continue;
      seenDoctors.add(appt.doctorId);
      list.push(appt);
    }
    return list;
  });

  reviewByDoctorId = computed(() => {
    const map = new Map<number, Review>();
    for (const r of this.myReviews()) {
      if (r.doctorId != null && !map.has(r.doctorId)) map.set(r.doctorId, r);
    }
    return map;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.appointmentService.getMyAppointments().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res?.data) ? res.data
                   : Array.isArray(res) ? res
                   : [];
        this.appointments.set(list);
        this.loadReviews();
      },
      error: () => {
        this.errorMsg.set('حصل خطأ أثناء تحميل بياناتك، حاول تاني.');
        this.loading.set(false);
      },
    });
  }

  private loadReviews(): void {
    this.reviewService.getMyReviews().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res?.data?.reviews) ? res.data.reviews
                   : Array.isArray(res?.reviews) ? res.reviews
                   : Array.isArray(res?.data) ? res.data
                   : Array.isArray(res) ? res
                   : [];
        this.myReviews.set(list);
        this.loading.set(false);
      },
      error: () => {
        // نكمل من غيرها؛ الكروت هتفضل شغالة في وضع "لسه ما اتقيّمتش"
        this.loading.set(false);
      },
    });
  }

  existingReviewFor(appt: Appointment): Review | null {
    return this.reviewByDoctorId().get(appt.doctorId!) ?? null;
  }

  onReviewSaved(review: Review): void {
    this.myReviews.update((list) => {
      const exists = list.some((r) => r.id === review.id);
      return exists ? list.map((r) => (r.id === review.id ? review : r)) : [...list, review];
    });
  }

  onReviewDeleted(reviewId: number): void {
    this.myReviews.update((list) => list.filter((r) => r.id !== reviewId));
  }
}