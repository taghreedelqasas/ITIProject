// src/app/features/admin/appointments/appointments-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { AdminAppointmentsService } from '../../../core/services/admin-appointments.service';
import {
  AdminAppointmentDto,
  AdminAppointmentsSummaryDto,
  AppointmentStatusValue,
} from '../../../core/models/admin-dashboard.models';
import { formatCount, formatCurrencyCompact } from '../../../core/utils/number-format.util';

type StatusFilter = AppointmentStatusValue | 'All';

interface KpiCardView {
  title: string;
  valueText: string;
  icon: 'clock' | 'hourglass' | 'check' | 'x' | 'calendar';
  accent: 'violet' | 'amber' | 'emerald' | 'red';
}

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments-list.component.html',
})
export class AppointmentsListComponent implements OnInit {
  loadingSummary = true;
  summaryError = false;
  kpiCards: KpiCardView[] = [];

  loadingList = true;
  listError = false;
  appointments: AdminAppointmentDto[] = [];

  totalCount = 0;
  totalPages = 1;
  currentPage = 1;
  pageSize = 6;

  searchTerm = '';
  statusFilter: StatusFilter = 'All';
  dateFilter = ''; // "yyyy-MM-dd" من input[type=date]

  private searchChanged = new Subject<string>();

  statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'All', label: 'كل الحالات' },
    { value: 'Pending', label: 'قيد الانتظار' },
    { value: 'Confirmed', label: 'مؤكد' },
    { value: 'Completed', label: 'مكتمل' },
    { value: 'Cancelled', label: 'ملغي' },
  ];

  constructor(private readonly appointmentsService: AdminAppointmentsService) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadAppointments();

    this.searchChanged.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 1;
      this.loadAppointments();
    });
  }

  private loadSummary(): void {
    this.loadingSummary = true;
    this.summaryError = false;

    this.appointmentsService
      .getSummary()
      .pipe(finalize(() => (this.loadingSummary = false)))
      .subscribe({
        next: (summary) => (this.kpiCards = this.buildKpiCards(summary)),
        error: () => (this.summaryError = true),
      });
  }

  loadAppointments(): void {
    this.loadingList = true;
    this.listError = false;

    this.appointmentsService
      .getAppointments({
        page: this.currentPage,
        pageSize: this.pageSize,
        status: this.statusFilter === 'All' ? null : this.statusFilter,
        date: this.dateFilter || null,
        search: this.searchTerm || null,
      })
      .pipe(finalize(() => (this.loadingList = false)))
      .subscribe({
        next: (result) => {
          this.appointments = result.items;
          this.totalCount = result.totalCount;
          this.totalPages = result.totalPages || 1;
        },
        error: () => (this.listError = true),
      });
  }

  onSearchInput(): void {
    this.searchChanged.next(this.searchTerm);
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadAppointments();
  }

  onDateChange(): void {
    this.currentPage = 1;
    this.loadAppointments();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'All';
    this.dateFilter = '';
    this.currentPage = 1;
    this.loadAppointments();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadAppointments();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get rangeStart(): number {
    return this.totalCount === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  statusBadgeClasses(status: AppointmentStatusValue): string {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-600';
      case 'Confirmed':
        return 'bg-amber-50 text-amber-600';
      case 'Cancelled':
        return 'bg-red-50 text-red-500';
      default: // Pending
        return 'bg-blue-50 text-blue-600';
    }
  }

  formatCount = formatCount;
  formatCurrencyCompact = formatCurrencyCompact;

  // ملحوظة: "مؤجلة" شيلناها من الكروت لأنها مش موجودة كحالة في الباك خالص -
  // بنعرض بدالها كل الحالات الحقيقية المتاحة فعليًا.
  private buildKpiCards(summary: AdminAppointmentsSummaryDto): KpiCardView[] {
    return [
      { title: 'حجوزات اليوم', valueText: formatCount(summary.todayBookings), icon: 'calendar', accent: 'violet' },
      { title: 'قيد الانتظار', valueText: formatCount(summary.pending), icon: 'hourglass', accent: 'amber' },
      { title: 'مؤكدة', valueText: formatCount(summary.confirmed), icon: 'clock', accent: 'violet' },
      { title: 'مكتملة', valueText: formatCount(summary.completed), icon: 'check', accent: 'emerald' },
      { title: 'ملغاة', valueText: formatCount(summary.cancelled), icon: 'x', accent: 'red' },
    ];
  }
}
