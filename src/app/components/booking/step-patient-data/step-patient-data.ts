import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingStateService, COUNTRIES } from '../booking-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-patient-data',
  imports: [FormsModule, CommonModule],
  templateUrl: './step-patient-data.html',
})
export class StepPatientData {
  state = inject(BookingStateService);
  countries = COUNTRIES;
  private router = inject(Router);

  onBack(): void {
    this.router.navigate(['/booking/date-time']);
  }

  onSubmit(): void {
    if (!this.state.isPatientFormValid()) return;
    this.router.navigate(['/booking/review']);
  }
}
