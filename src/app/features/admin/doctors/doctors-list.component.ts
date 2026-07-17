// src/app/features/admin/doctors/doctors-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AdminPeopleService } from '../../../core/services/admin-people.service';
import {
  AdminDoctorDto,
  DoctorPendingDto,
  DoctorVerificationStatusValue,
} from '../../../core/models/admin-dashboard.models';
import { formatCount, formatCurrencyCompact } from '../../../core/utils/number-format.util';
import { DoctorProfilePanelComponent } from './doctor-profile-panel.component';

type SortDirection = 'asc' | 'desc';
type VerificationFilter = DoctorVerificationStatusValue | 'All';

interface KpiCardView {
  title: string;
  valueText: string;
  changePercentage: number;
  comparisonText: string; // نص جاهز - لأن كارت "بانتظار الاعتماد" مختلف عن الباقي
  icon: 'calendar' | 'star' | 'suspended' | 'clock' | 'check' | 'doctors';
}

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorProfilePanelComponent],
  templateUrl: './doctors-list.component.html',
})
export class DoctorsListComponent implements OnInit {
  // ===== كروت الـ KPI =====
  loadingOverview = true;
  overviewError = false;
  kpiCards: KpiCardView[] = [];

  // ===== طلبات الاعتماد المعلقة =====
  loadingPending = true;
  pendingError = false;
  pendingDoctors: DoctorPendingDto[] = [];
  actioningUserId: string | null = null; // اللي جاري قبوله/رفضه دلوقتي

  rejectTarget: DoctorPendingDto | null = null;
  rejectReason = '';

  // ===== جدول كل الأطباء (Client-side search/sort/pagination زي شاشة المرضى) =====
  loadingList = true;
  listError = false;
  private allDoctors: AdminDoctorDto[] = [];

  searchTerm = '';
  verificationFilter: VerificationFilter = 'All';
  sortDirection: SortDirection = 'asc';

  pageSize = 6;
  currentPage = 1;

  verificationOptions: { value: VerificationFilter; label: string }[] = [
    { value: 'All', label: 'كل الحالات' },
    { value: 'Approved', label: 'معتمد' },
    { value: 'Pending', label: 'بانتظار المراجعة' },
    { value: 'Rejected', label: 'مرفوض' },
  ];

  // ===== بروفايل الطبيب =====
  selectedDoctorId: number | null = null;

  formatCount = formatCount;
  formatCurrencyCompact = formatCurrencyCompact;

  constructor(private readonly peopleService: AdminPeopleService) {}

  ngOnInit(): void {
    this.loadOverview();
    this.loadPending();
    this.loadDoctors();
  }

  // ---------------- الكروت ----------------
  private loadOverview(): void {
    this.loadingOverview = true;
    this.overviewError = false;

    this.peopleService
      .getDoctorsOverview()
      .pipe(finalize(() => (this.loadingOverview = false)))
      .subscribe({
        next: (overview) => {
          this.kpiCards = [
            {
              title: 'إجمالي الحجوزات',
              valueText: formatCount(overview.totalBookings.value),
              changePercentage: overview.totalBookings.changePercentage,
              comparisonText: `${overview.totalBookings.changePercentage >= 0 ? '+' : ''}${overview.totalBookings.changePercentage.toFixed(1)}%`,
              icon: 'calendar',
            },
            {
              title: 'متوسط التقييمات',
              valueText: overview.averageRating.value.toFixed(2),
              changePercentage: overview.averageRating.changePercentage,
              comparisonText: `${overview.averageRating.changePercentage >= 0 ? '+' : ''}${overview.averageRating.changePercentage.toFixed(1)}%`,
              icon: 'star',
            },
            {
              title: 'الأطباء الموقوفون',
              valueText: formatCount(overview.suspendedDoctors.value),
              changePercentage: overview.suspendedDoctors.changePercentage,
              comparisonText: `${overview.suspendedDoctors.changePercentage >= 0 ? '+' : ''}${overview.suspendedDoctors.changePercentage.toFixed(1)}%`,
              icon: 'suspended',
            },
            {
              // ملحوظة: الكارت ده بيعرض عدد جداد الشهر ده كعدد مطلق، مش نسبة زي باقي الكروت
              title: 'بانتظار الاعتماد',
              valueText: formatCount(overview.pendingApproval.value),
              changePercentage: overview.pendingApproval.changePercentage,
              comparisonText: `+${formatCount(overview.pendingApproval.comparisonValue)} هذا الشهر`,
              icon: 'clock',
            },
            {
              title: 'الأطباء النشطون',
              valueText: formatCount(overview.activeDoctors.value),
              changePercentage: overview.activeDoctors.changePercentage,
              comparisonText: `${overview.activeDoctors.changePercentage >= 0 ? '+' : ''}${overview.activeDoctors.changePercentage.toFixed(1)}%`,
              icon: 'check',
            },
            {
              title: 'إجمالي الأطباء',
              valueText: formatCount(overview.totalDoctors.value),
              changePercentage: overview.totalDoctors.changePercentage,
              comparisonText: `${overview.totalDoctors.changePercentage >= 0 ? '+' : ''}${overview.totalDoctors.changePercentage.toFixed(1)}%`,
              icon: 'doctors',
            },
          ];
        },
        error: () => (this.overviewError = true),
      });
  }

  // ---------------- طلبات الاعتماد المعلقة ----------------
  loadPending(): void {
    this.loadingPending = true;
    this.pendingError = false;

    this.peopleService
      .getPendingDoctors()
      .pipe(finalize(() => (this.loadingPending = false)))
      .subscribe({
        next: (list) => (this.pendingDoctors = list),
        error: () => (this.pendingError = true),
      });
  }

  approve(doctor: DoctorPendingDto): void {
    this.actioningUserId = doctor.userId;
    this.peopleService
      .approveDoctor(doctor.userId)
      .pipe(finalize(() => (this.actioningUserId = null)))
      .subscribe({
        next: () => {
          this.pendingDoctors = this.pendingDoctors.filter((d) => d.userId !== doctor.userId);
          this.loadOverview();
          this.loadDoctors();
        },
        error: () => (this.pendingError = true),
      });
  }

  openRejectModal(doctor: DoctorPendingDto): void {
    this.rejectTarget = doctor;
    this.rejectReason = '';
  }

  closeRejectModal(): void {
    this.rejectTarget = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.rejectTarget) return;
    const doctor = this.rejectTarget;
    this.actioningUserId = doctor.userId;

    this.peopleService
      .rejectDoctor(doctor.userId, this.rejectReason || undefined)
      .pipe(finalize(() => (this.actioningUserId = null)))
      .subscribe({
        next: () => {
          this.pendingDoctors = this.pendingDoctors.filter((d) => d.userId !== doctor.userId);
          this.closeRejectModal();
          this.loadOverview();
          this.loadDoctors();
        },
        error: () => (this.pendingError = true),
      });
  }

  // ---------------- جدول كل الأطباء ----------------
  loadDoctors(): void {
    this.loadingList = true;
    this.listError = false;

    this.peopleService
      .getAllDoctors()
      .pipe(finalize(() => (this.loadingList = false)))
      .subscribe({
        next: (doctors) => (this.allDoctors = doctors),
        error: () => (this.listError = true),
      });
  }

  get filteredDoctors(): AdminDoctorDto[] {
    const term = this.searchTerm.trim().toLowerCase();

    let result = this.allDoctors;

    if (term) {
      result = result.filter((d) => d.fullName.toLowerCase().includes(term));
    }

    if (this.verificationFilter !== 'All') {
      result = result.filter((d) => d.verificationStatus === this.verificationFilter);
    }

    result = [...result].sort((a, b) =>
      this.sortDirection === 'asc'
        ? a.fullName.localeCompare(b.fullName, 'ar')
        : b.fullName.localeCompare(a.fullName, 'ar')
    );

    return result;
  }

  toggleSort(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  get totalCount(): number {
    return this.filteredDoctors.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get pagedDoctors(): AdminDoctorDto[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDoctors.slice(start, start + this.pageSize);
  }

  get rangeStart(): number {
    return this.totalCount === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  verificationBadgeClasses(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-600';
      case 'Rejected':
        return 'bg-red-50 text-red-500';
      default: // Pending
        return 'bg-amber-50 text-amber-600';
    }
  }

  accountBadgeClasses(isActive: boolean): string {
    return isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500';
  }

  // ---------------- بروفايل الطبيب ----------------
  openProfile(doctor: AdminDoctorDto): void {
    this.selectedDoctorId = doctor.id;
  }

  closeProfile(): void {
    this.selectedDoctorId = null;
  }

  documentsOf(doctor: DoctorPendingDto): { label: string; url: string | null }[] {
  return [
    { label: 'البطاقة', url: this.toDocumentUrl(doctor.ssnImg) },
    { label: 'رخصة مزاولة المهنة', url: this.toDocumentUrl(doctor.licenseImage) },
    { label: 'شهادة المؤهل', url: this.toDocumentUrl(doctor.certificateImage) },
  ];
}

private toDocumentUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  return `data:image/jpeg;base64,${value}`;
}

  initials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }

  daysAgo(dateStr: string): string {
    const created = new Date(dateStr).getTime();
    const diffDays = Math.max(0, Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24)));
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'منذ يوم';
    if (diffDays === 2) return 'منذ يومين';
    return `منذ ${diffDays} يوم`;
  }
}
