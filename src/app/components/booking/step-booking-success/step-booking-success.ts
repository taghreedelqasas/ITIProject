import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BookingStateService } from '../booking-state.service';

@Component({
  selector: 'app-step-booking-success',
  imports: [],
  templateUrl: './step-booking-success.html',
})
export class StepBookingSuccess {
  state = inject(BookingStateService);
  private router = inject(Router);

  onBackToHome(): void {
    if (this.state.rebookId) {
      this.router.navigate(['/profile'], {
        queryParams: {
          rebookSuccess: this.state.rebookId,
          rebookDoctorName: this.state.doctor().name,
          rebookSpecialty: this.state.doctor().specialty,
          rebookImage: this.state.doctorImage(),
          rebookLocation: this.state.doctor().location,
          rebookDate: this.state.selectedDateLabel(),
          rebookTime: this.state.selectedTime(),
        },
      });
    } else {
      this.router.navigate(['/profile']);
    }
  }

  onGoToConsult(): void {
    this.router.navigate(['/consult'], {
      queryParams: {
        doctorId: this.state.doctorId,
        doctorName: this.state.doctor().name,
        specialty: this.state.doctor().specialty,
        location: this.state.doctor().location,
        image: this.state.doctorImage(),
        rating: this.state.doctor().rating,
        reviewsCount: this.state.doctor().reviewsCount,
      },
    });
  }

  onBookAnother(): void {
    this.state.resetForNewBooking();
    this.router.navigate(['/booking/date-time']);
  }
}
