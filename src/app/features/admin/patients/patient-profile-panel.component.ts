// src/app/features/admin/patients/patient-profile-panel.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs';

import { AdminPeopleService } from '../../../core/services/admin-people.service';
import { AdminPatientDetailDto } from '../../../core/models/admin-dashboard.models';
import { environment } from '../../../../environments/environment';

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

  // الباك بيرجع fileUrl كمسار نسبي زي "/uploads/xxx.png" (مش رابط كامل).
  // لو فتحناه زي ما هو، المتصفح هيحاول يفتحه على دومين الفرونت (localhost:4200)
  // بدل دومين الباك، فتظهر "Cannot GET". هنا بنركّب الرابط الكامل قبل الفتح.
  private resolveFileUrl(url: string): string {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url; // رابط كامل أصلًا
    const backendOrigin = new URL(environment.apiBaseUrl).origin;
    return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  openFile(url: string): void {
    window.open(this.resolveFileUrl(url), '_blank');
  }
}
