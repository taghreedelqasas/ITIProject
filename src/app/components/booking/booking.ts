import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BookingStateService } from './booking-state.service';
import { filter } from 'rxjs/operators';
import { PaymentOverlay } from './payment-overlay/payment-overlay';

interface BookingStep {
  num: number;
  label: string;
}

@Component({
  selector: 'app-booking',
  imports: [RouterOutlet, PaymentOverlay],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {
  state = inject(BookingStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  pageTitle = 'حجز موعد';
  pageSubtitle = 'إحجز موعدك بكل سهولة مع موعد';

  steps: BookingStep[] = [
    { num: 3, label: 'التأكيد' },
    { num: 2, label: 'بيانات المريض' },
    { num: 1, label: 'التاريخ والوقت' },
  ];

  currentStep = 1;

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const paramMap: { [key: string]: string | null } = {};
    params.keys.forEach(key => { paramMap[key] = params.get(key); });
    this.state.initFromQueryParams(paramMap);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.updateCurrentStep(e.urlAfterRedirects || e.url);
      });

    this.updateCurrentStep(this.router.url);
  }

  private updateCurrentStep(url: string): void {
    if (url.includes('/booking/date-time')) this.currentStep = 1;
    else if (url.includes('/booking/patient-data')) this.currentStep = 2;
    else if (url.includes('/booking/review')) this.currentStep = 3;
    else if (url.includes('/booking/success')) this.currentStep = 4;
  }
}
