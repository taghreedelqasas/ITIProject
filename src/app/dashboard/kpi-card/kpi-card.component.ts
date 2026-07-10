// dashboard/kpi-card/kpi-card.component.ts

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconKey, KpiCard } from '../models/dashboard.models';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
      dir="rtl"
    >
      <div class="flex items-center justify-between">
        <span
          class="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
          [ngClass]="
            card.changePercentage >= 0
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
          "
        >
          <svg
            *ngIf="card.changePercentage >= 0"
            xmlns="http://www.w3.org/2000/svg"
            class="w-3 h-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12 7a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 11-2 0V9.414l-4.293 4.293a1 1 0 01-1.414 0L8 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 11.586 14.586 8H13a1 1 0 01-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            *ngIf="card.changePercentage < 0"
            xmlns="http://www.w3.org/2000/svg"
            class="w-3 h-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12 13a1 1 0 011 1v4a1 1 0 01-1 1H8a1 1 0 110-2h1.586l-4.293-4.293a1 1 0 011.414-1.414L11 14.586l3.586-3.586a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0L8 15.828V15a1 1 0 01-1-1V9a1 1 0 011-1h4a1 1 0 011 1v4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ card.changePercentage >= 0 ? '+' : '' }}{{ card.changePercentage }}%
        </span>

        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-500"
        >
          <ng-container [ngSwitch]="icon">
            <svg *ngSwitchCase="'clock'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="9" /><path stroke-linecap="round" d="M12 7v5l3 3" />
            </svg>
            <svg *ngSwitchCase="'calendar'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="5" width="18" height="16" rx="2" /><path stroke-linecap="round" d="M8 3v4M16 3v4M3 10h18" />
            </svg>
            <svg *ngSwitchCase="'patients'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1" />
              <circle cx="9" cy="7" r="3" /><path stroke-linecap="round" d="M20 19v-1a3.5 3.5 0 00-2.5-3.36M14.5 3.36A3.5 3.5 0 0117 6.7" />
            </svg>
            <svg *ngSwitchCase="'doctors'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 3v3a3 3 0 006 0V3M9 3H7a2 2 0 00-2 2v3a6 6 0 0012 0V5a2 2 0 00-2-2h-2" />
              <circle cx="19" cy="18" r="2" /><path stroke-linecap="round" d="M12 15v2a3 3 0 003 3" />
            </svg>
            <svg *ngSwitchCase="'check'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="9" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4" />
            </svg>
            <svg *ngSwitchCase="'medal'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="15" r="5" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 11 7 3h3l2 5M15 11l2-8h-3l-2 5" />
            </svg>
            <svg *ngSwitchCase="'money'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="9" /><path stroke-linecap="round" stroke-linejoin="round" d="M9.5 15.5c0 1 1 1.5 2.5 1.5s2.5-.6 2.5-1.7c0-2.3-5-1-5-3.3 0-1.1 1-1.7 2.5-1.7s2.5.5 2.5 1.5M12 7v1M12 16v1" />
            </svg>
            <svg *ngSwitchCase="'chat'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a8 8 0 10-3.6 6.7L21 20l-1.2-3.5A7.96 7.96 0 0021 12z" />
            </svg>
          </ng-container>
        </div>
      </div>

      <div class="text-right">
        <p class="text-2xl font-bold text-gray-900 leading-none mb-1">
          {{ formattedValue }}
        </p>
        <p class="text-sm text-gray-500">{{ label }}</p>
      </div>

      <div class="flex items-center gap-1 text-xs text-gray-400" dir="rtl">
        <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
        {{ formattedComparisonValue }} {{ card.comparisonLabel }}
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) icon!: IconKey;
  @Input({ required: true }) card!: KpiCard;
  @Input() format: 'number' | 'currency' | 'percent' = 'number';

  get formattedValue(): string {
    return this.formatNumber(this.card?.value);
  }

  get formattedComparisonValue(): string {
    return this.formatNumber(this.card?.comparisonValue);
  }

  private formatNumber(value: number): string {
    if (value === null || value === undefined) return '-';

    if (this.format === 'percent') {
      return `${value}%`;
    }

    if (this.format === 'currency') {
      if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M ج.م`;
      }
      if (value >= 1_000) {
        return `${(value / 1_000).toFixed(0)}K ج.م`;
      }
      return `${value.toLocaleString('ar-EG')} ج.م`;
    }

    return value.toLocaleString('ar-EG');
  }
}