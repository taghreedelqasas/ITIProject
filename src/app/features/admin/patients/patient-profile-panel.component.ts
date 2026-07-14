// src/app/features/admin/patients/patient-profile-panel.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs';

import { AdminPeopleService } from '../../../core/services/admin-people.service';
import { AdminPatientDetailDto } from '../../../core/models/admin-dashboard.models';

@Component({
  selector: 'app-patient-profile-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-profile-panel.component.html',
})
export class PatientProfilePanelComponent implements OnChanges {
  @Input() patientId: number | null = null;
  @Output() closed = new EventEmitter<void>();

  loading = false;
  error = false;
  patient: AdminPatientDetailDto | null = null;

  constructor(private readonly peopleService: AdminPeopleService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patientId'] && this.patientId != null) {
      this.load(this.patientId);
    }
  }

  load(id: number): void {
    this.loading = true;
    this.error = false;
    this.patient = null;

    this.peopleService
      .getPatientDetail(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (patient) => (this.patient = patient),
        error: () => (this.error = true),
      });
  }

  close(): void {
    this.closed.emit();
  }

  // "السكري النوع الثاني, ضغط الدم المرتفع" -> ["السكري النوع الثاني", "ضغط الدم المرتفع"]
  // ملحوظة: دي مجرد تقسيم بفواصل لعرض شكلي زي التصميم - الباك بيخزنها نص حر واحد،
  // مش Array منظم، فلو حد كتبها من غير فواصل هتتعرض كسطر واحد.
  get chronicConditions(): string[] {
    if (!this.patient?.medicalHistory) return [];
    return this.patient.medicalHistory
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  categoryIcon(categoryLabel: string): 'lab' | 'scan' | 'prescription' | 'report' {
    if (categoryLabel.includes('تحليل')) return 'lab';
    if (categoryLabel.includes('أشعة')) return 'scan';
    if (categoryLabel.includes('وصفة')) return 'prescription';
    return 'report';
  }

  openFile(url: string): void {
    window.open(url, '_blank');
  }
}
