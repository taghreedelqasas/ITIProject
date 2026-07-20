// src/app/features/admin/payments/payments-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { finalize } from 'rxjs';

import { AdminPaymentsService } from '../../../core/services/admin-payments.service';
import {
  AdminTransactionDto,
  PaymentStatusValue,
  PaymentsSummaryDto,
  RevenueCommissionTrendDto,
} from '../../../core/models/admin-payments.models';
import { formatCurrencyFull } from '../../../core/utils/number-format.util';

type StatusFilter = PaymentStatusValue | 'All';

interface KpiCardView {
  title: string;
  valueText: string;
  icon: 'pending' | 'profit' | 'commission' | 'revenue';
}

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './payments-list.component.html',
})
export class PaymentsListComponent implements OnInit {
  // ---------------- كروت الملخص ----------------
  loadingSummary = true;
  summaryError = false;
  kpiCards: KpiCardView[] = [];
  commissionRate = 0;

  // ---------------- نسبة العمولة ----------------
  editableRate: number | null = null;
  savingRate = false;
  rateSaveError = '';
  rateSaveSuccess = false;

  // ---------------- تحليل الإيرادات والعمولات ----------------
  loadingTrend = true;
  trendError = false;
  trendChart: ApexOptions = {};

  // ---------------- جدول المعاملات ----------------
  loadingList = true;
  listError = false;
  transactions: AdminTransactionDto[] = [];

  totalCount = 0;
  currentPage = 1;
  pageSize = 6;
  statusFilter: StatusFilter = 'All';

  formatCurrencyFull = formatCurrencyFull;

  constructor(private readonly paymentsService: AdminPaymentsService) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadTrend();
    this.loadTransactions();
  }

  // ============ الملخص ============
  loadSummary(): void {
    this.loadingSummary = true;
    this.summaryError = false;

    this.paymentsService
      .getSummary()
      .pipe(finalize(() => (this.loadingSummary = false)))
      .subscribe({
        next: (summary) => {
          this.commissionRate = summary.commissionRate;
          this.editableRate = summary.commissionRate;
          this.kpiCards = this.buildKpiCards(summary);
        },
        error: () => (this.summaryError = true),
      });
  }

  private buildKpiCards(summary: PaymentsSummaryDto): KpiCardView[] {
    return [
      {
        title: 'المدفوعات المعلقة',
        valueText: formatCurrencyFull(summary.pendingPayments.value),
        icon: 'pending',
      },
      {
        title: 'أرباح الأطباء',
        valueText: formatCurrencyFull(summary.doctorsProfit.value),
        icon: 'profit',
      },
      {
        title: `عمولة المنصة (${summary.commissionRate}%)`,
        valueText: formatCurrencyFull(summary.platformCommission.value),
        icon: 'commission',
      },
      {
        title: 'إجمالي الإيرادات',
        valueText: formatCurrencyFull(summary.totalRevenue.value),
        icon: 'revenue',
      },
    ];
  }

  // ============ نسبة العمولة ============
  saveCommissionRate(): void {
    if (this.editableRate == null || this.editableRate < 0 || this.editableRate > 100) {
      this.rateSaveError = 'نسبة العمولة يجب أن تكون بين 0 و100.';
      return;
    }

    this.savingRate = true;
    this.rateSaveError = '';
    this.rateSaveSuccess = false;

    this.paymentsService
      .updateCommissionRate(this.editableRate)
      .pipe(finalize(() => (this.savingRate = false)))
      .subscribe({
        next: (res) => {
          this.commissionRate = res.data.commissionRate;
          this.rateSaveSuccess = true;
          // نحدّث كارت "عمولة المنصة" وكروت الملخص من غير ما نعمل رحلة تحميل تانية بالكامل
          this.loadSummary();
        },
        error: (err) => {
          this.rateSaveError = err?.error?.message || 'تعذر تعديل نسبة العمولة.';
        },
      });
  }

  // ============ تحليل الإيرادات والعمولات ============
  // ملحوظة: بيانات ثابتة (static) مؤقتًا لحد ما نتأكد إن الـ endpoint بتاع الباك بيرجّع بيانات فعلية.
  loadTrend(): void {
  this.loadingTrend = true;
  this.trendError = false;

  const staticTrend: RevenueCommissionTrendDto = {
    points: [
      { year: 2026, month: 2, label: 'فبراير', revenue: 1800, commission: 180 },
      { year: 2026, month: 3, label: 'مارس', revenue: 2100, commission: 210 },
      { year: 2026, month: 4, label: 'أبريل', revenue: 1650, commission: 165 },
      { year: 2026, month: 5, label: 'مايو', revenue: 2400, commission: 240 },
      { year: 2026, month: 6, label: 'يونيو', revenue: 2200, commission: 220 },
      { year: 2026, month: 7, label: 'يوليو', revenue: 2850, commission: 285 },
    ],
  };

  // تحويل جميع الشهور إلى صفر ماعدا شهر يوليو (month === 7)
  const juneOnlyTrend: RevenueCommissionTrendDto = {
    ...staticTrend,
    points: staticTrend.points.map((p) =>
      p.month === 7 ? p : { ...p, revenue: 0, commission: 0 }
    ),
  };

  this.trendChart = this.buildTrendOptions(juneOnlyTrend);
  this.loadingTrend = false;

  // الكود الأصلي اللي بيجيب البيانات من الباك - هنرجعله لما الـ API يبقى جاهز:
  // this.paymentsService
  //   .getRevenueCommissionTrend(6)
  //   .pipe(
  //     map((trend) => ({
  //       ...trend,
  //       points: trend.points.map((p) =>
  //         p.month === 7 ? p : { ...p, revenue: 0, commission: 0 }
  //       ),
  //     })),
  //     finalize(() => (this.loadingTrend = false))
  //   )
  //   .subscribe({
  //     next: (trend) => (this.trendChart = this.buildTrendOptions(trend)),
  //     error: () => (this.trendError = true),
  //   });
}

private buildTrendOptions(trend: RevenueCommissionTrendDto): ApexOptions {
  return {
    chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'Cairo, sans-serif' },
    series: [
      { name: 'الإيرادات', data: trend.points.map((p) => p.revenue) },
      { name: 'العمولة', data: trend.points.map((p) => p.commission) },
    ],
    xaxis: {
      categories: trend.points.map((p) => p.label),
      labels: { style: { colors: '#94a3b8' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    colors: ['#2DD4BF', '#4C1D95'],
    plotOptions: {
      bar: { columnWidth: '55%', borderRadius: 4, borderRadiusApplication: 'end' },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f5f9' },
    legend: { show: false },
    tooltip: { theme: 'light' },
  };
}

  // ============ جدول المعاملات ============
  loadTransactions(): void {
    this.loadingList = true;
    this.listError = false;

    this.paymentsService
      .getTransactions({
        page: this.currentPage,
        pageSize: this.pageSize,
        status: this.statusFilter === 'All' ? null : this.statusFilter,
      })
      .pipe(finalize(() => (this.loadingList = false)))
      .subscribe({
        next: (result) => {
          this.transactions = result.items;
          this.totalCount = result.totalCount;
        },
        error: () => (this.listError = true),
      });
  }

  resetFilters(): void {
    this.statusFilter = 'All';
    this.currentPage = 1;
    this.loadTransactions();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadTransactions();
  }

  // الباك مش بيرجع totalPages لـ endpoint المعاملات - بنحسبها هنا من totalCount/pageSize
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  statusBadgeClasses(status: PaymentStatusValue): string {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-600';
      case 'Pending':
        return 'bg-amber-50 text-amber-600';
      case 'Failed':
        return 'bg-red-50 text-red-500';
      default: // Refunded
        return 'bg-blue-50 text-blue-600';
    }
  }
}