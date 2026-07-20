// src/app/features/admin/doctors/doctor-profile-panel.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs';

import { AdminPeopleService } from '../../../core/services/admin-people.service';
import { AdminDoctorDetailDto } from '../../../core/models/admin-dashboard.models';
import { formatCount, formatCurrencyCompact } from '../../../core/utils/number-format.util';

@Component({
  selector: 'app-doctor-profile-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-profile-panel.component.html',
})
export class DoctorProfilePanelComponent implements OnChanges {
  @Input() doctorId: number | null = null;
  @Output() closed = new EventEmitter<void>();

  loading = false;
  error = false;
  doctor: AdminDoctorDetailDto | null = null;

  formatCount = formatCount;
  formatCurrencyCompact = formatCurrencyCompact;

  constructor(private readonly peopleService: AdminPeopleService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['doctorId'] && this.doctorId != null) {
      this.load(this.doctorId);
    }
  }

  load(id: number): void {
    this.loading = true;
    this.error = false;
    this.doctor = null;

    this.peopleService
      .getDoctorDetail(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (doctor) => (this.doctor = doctor),
        error: () => (this.error = true),
      });
  }

  close(): void {
    this.closed.emit();
  }
}
