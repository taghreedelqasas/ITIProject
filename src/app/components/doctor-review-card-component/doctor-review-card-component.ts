import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../core/services/review.service';
import { Review } from '../../core/models/review.model';
import { Appointment } from '../../core/models/appointment.model';

@Component({
  selector: 'app-doctor-review-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-review-card-component.html',
  styleUrl: './doctor-review-card-component.css',
})
export class DoctorReviewCardComponent implements OnInit {
  @Input({ required: true }) appointment!: Appointment;
  // لو فيه تقييم موجود بالفعل لنفس الموعد، الكارت يفتح مليان وفي وضع التعديل
  @Input() existingReview: Review | null = null;

  @Output() saved = new EventEmitter<Review>();
  @Output() deleted = new EventEmitter<number>();

  private reviewService = inject(ReviewService);

  submitting = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  rating = signal<number>(0);
  hoverRating = signal<number>(0);
  comment = signal<string>('');

  get isEditMode(): boolean {
    return !!this.existingReview;
  }

  ngOnInit(): void {
    if (this.existingReview) {
      this.rating.set(this.existingReview.rating ?? 0);
      this.comment.set(this.existingReview.comment ?? '');
    }
  }

  formatDate(iso?: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatTime(iso?: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  setRating(value: number): void {
    this.rating.set(value);
  }

  setHover(value: number): void {
    this.hoverRating.set(value);
  }

  clearHover(): void {
    this.hoverRating.set(0);
  }

  displayedStars(): number {
    return this.hoverRating() || this.rating();
  }

  onCommentChange(value: string): void {
    this.comment.set(value);
  }

  submit(): void {
    if (this.rating() < 1) {
      this.errorMsg.set('اختاري تقييم من ١ لـ ٥ نجوم.');
      return;
    }

    this.submitting.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    if (this.isEditMode && this.existingReview) {
      this.reviewService
        .update(this.existingReview.id, {
          rating: this.rating(),
          comment: this.comment() || null,
        })
        .subscribe({
          next: (res) => {
            this.submitting.set(false);
            this.successMsg.set('تم تحديث تقييمك.');
            const updated = ((res as any)?.data ?? res) as Review;
            this.saved.emit({
              ...this.existingReview,
              ...updated,
              rating: this.rating(),
              comment: this.comment(),
            });
          },
          error: (err) => {
            this.submitting.set(false);
            this.errorMsg.set(err?.error?.message || 'تعذر تعديل التقييم، حاول مرة أخرى.');
          },
        });
      return;
    }

    if (!this.appointment.doctorId || !this.appointment.id) {
      this.submitting.set(false);
      this.errorMsg.set('تعذر تحديد بيانات الموعد.');
      return;
    }

    this.reviewService
      .create({
        doctorId: this.appointment.doctorId,
        rating: this.rating(),
        comment: this.comment() || null,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.successMsg.set('تم إرسال تقييمك، شكرًا لك.');
          const created = ((res as any)?.data ?? res) as Review;
          this.saved.emit(created);
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMsg.set(err?.error?.message || 'تعذر إرسال التقييم، حاول مرة أخرى.');
        },
      });
  }

  removeReview(): void {
    if (!this.existingReview) return;

    this.submitting.set(true);
    this.errorMsg.set(null);

    this.reviewService.delete(this.existingReview.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleted.emit(this.existingReview!.id);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err?.error?.message || 'تعذر حذف التقييم، حاول مرة أخرى.');
      },
    });
  }
}