import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BookingStateService } from '../booking-state.service';

@Component({
  selector: 'app-step-review-confirm',
  imports: [],
  templateUrl: './step-review-confirm.html',
})
export class StepReviewConfirm {
  state = inject(BookingStateService);
  private router = inject(Router);

  onBack(): void {
    this.router.navigate(['/booking/patient-data']);
  }

  onConfirm(): void {
    this.state.onConfirmBooking();
  }

  onRetryPayment(): void {
    this.state.retryPayment();
  }

  onSkipPayment(): void {
    this.state.skipPayment();
  }
}
