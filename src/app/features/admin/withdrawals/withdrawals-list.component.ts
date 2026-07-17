// src/app/features/admin/withdrawals/withdrawals-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';

import { AdminWithdrawService } from '../../../core/services/admin-withdraw.service';
import { WithdrawRequestAdminDto } from '../../../core/models/admin-withdraw.models';
import { formatCurrencyFull } from '../../../core/utils/number-format.util';

interface KpiCardView {
  title: string;
  valueText: string;
  icon: 'count' | 'total' | 'method';
}

@Component({
  selector: 'app-withdrawals-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './withdrawals-list.component.html',
})
export class WithdrawalsListComponent implements OnInit {
  // ---------------- قائمة طلبات السحب المعلقة ----------------
  loadingList = true;
  listError = false;
  requests: WithdrawRequestAdminDto[] = [];

  // اللي جاري قبوله/رفضه دلوقتي (بنعطل زراره بس مش الجدول كله)
  actioningId: number | null = null;

  // مودال تأكيد الرفض (السحب فلوس حقيقية - محتاجين تأكيد قبل أي إجراء)
  rejectTarget: WithdrawRequestAdminDto | null = null;
  actionError = '';

  formatCurrencyFull = formatCurrencyFull;

  constructor(private readonly withdrawService: AdminWithdrawService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loadingList = true;
    this.listError = false;

    this.withdrawService
      .getPendingRequests()
      .pipe(finalize(() => (this.loadingList = false)))
      .subscribe({
        next: (list) => (this.requests = list),
        error: () => (this.listError = true),
      });
  }

  // ---------------- كروت الملخص (محسوبة من القايمة نفسها - مفيش endpoint ملخص جاهز) ----------------
  get kpiCards(): KpiCardView[] {
    const totalAmount = this.requests.reduce((sum, r) => sum + r.amount, 0);
    const mostUsedMethod = this.mostUsedMethod();

    return [
      { title: 'طلبات السحب المعلقة', valueText: this.requests.length.toString(), icon: 'count' },
      { title: 'إجمالي المبلغ المطلوب سحبه', valueText: formatCurrencyFull(totalAmount), icon: 'total' },
      { title: 'الطريقة الأكثر استخدامًا', valueText: mostUsedMethod, icon: 'method' },
    ];
  }

  private mostUsedMethod(): string {
    if (this.requests.length === 0) return '-';
    const counts = new Map<string, number>();
    for (const r of this.requests) {
      counts.set(r.method, (counts.get(r.method) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  // ---------------- الموافقة ----------------
  approve(request: WithdrawRequestAdminDto): void {
    this.actioningId = request.id;
    this.actionError = '';

    this.withdrawService
      .approve(request.id)
      .pipe(finalize(() => (this.actioningId = null)))
      .subscribe({
        next: () => {
          this.requests = this.requests.filter((r) => r.id !== request.id);
        },
        error: (err) => {
          this.actionError = err?.error?.message || 'تعذر تنفيذ الموافقة على طلب السحب.';
        },
      });
  }

  // ---------------- الرفض ----------------
  openRejectModal(request: WithdrawRequestAdminDto): void {
    this.rejectTarget = request;
    this.actionError = '';
  }

  closeRejectModal(): void {
    this.rejectTarget = null;
  }

  confirmReject(): void {
    if (!this.rejectTarget) return;
    const request = this.rejectTarget;
    this.actioningId = request.id;
    this.actionError = '';

    this.withdrawService
      .reject(request.id)
      .pipe(finalize(() => (this.actioningId = null)))
      .subscribe({
        next: () => {
          this.requests = this.requests.filter((r) => r.id !== request.id);
          this.closeRejectModal();
        },
        error: (err) => {
          this.actionError = err?.error?.message || 'تعذر رفض طلب السحب.';
          this.closeRejectModal();
        },
      });
  }

  // ---------------- Helpers ----------------
  initials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }

  methodLabel(method: string): string {
    switch (method) {
      case 'InstaPay':
        return 'إنستاباي';
      case 'BankTransfer':
        return 'تحويل بنكي';
      case 'Vodafone Cash':
        return 'فودافون كاش';
      default:
        return method;
    }
  }

  formattedDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
