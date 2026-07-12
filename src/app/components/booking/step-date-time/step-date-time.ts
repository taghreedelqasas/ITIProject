import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BookingStateService } from '../booking-state.service';

@Component({
  selector: 'app-step-date-time',
  imports: [],
  templateUrl: './step-date-time.html',
})
export class StepDateTime {
  state = inject(BookingStateService);
  private router = inject(Router);

  onNext(): void {
    if (!this.state.selectedSlotId()) {
      this.state.errorMessage.set('من فضلك اختر ميعادًا متاحًا أولًا.');
      return;
    }
    this.state.errorMessage.set('');
    this.router.navigate(['/booking/patient-data']);
  }
}
