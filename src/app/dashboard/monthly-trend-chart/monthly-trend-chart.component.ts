// dashboard/monthly-trend-chart/monthly-trend-chart.component.ts
// يتطلب: npm install chart.js

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { MonthlyTrend, TrendType } from '../models/dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-monthly-trend-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full" dir="rtl">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 class="font-bold text-gray-800">
            اتجاه {{ activeType === 'revenue' ? 'الإيرادات' : 'المواعيد' }} الشهري
          </h3>
          <p class="text-xs text-gray-400 mt-0.5" *ngIf="data?.points?.length">
            {{ data!.points[0].label }} — {{ data!.points[data!.points.length - 1].label }}
          </p>
        </div>

        <div class="flex bg-gray-100 rounded-xl p-1 text-sm">
          <button
            type="button"
            class="px-4 py-1.5 rounded-lg transition-colors"
            [ngClass]="
              activeType === 'appointments'
                ? 'bg-white shadow text-gray-900 font-semibold'
                : 'text-gray-500'
            "
            (click)="onTabChange('appointments')"
          >
            المواعيد
          </button>
          <button
            type="button"
            class="px-4 py-1.5 rounded-lg transition-colors"
            [ngClass]="
              activeType === 'revenue'
                ? 'bg-white shadow text-gray-900 font-semibold'
                : 'text-gray-500'
            "
            (click)="onTabChange('revenue')"
          >
            الإيرادات
          </button>
        </div>
      </div>

      <div class="h-64">
        <canvas #canvas></canvas>
      </div>
    </div>
  `,
})
export class MonthlyTrendChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: MonthlyTrend | null = null;
  @Input() activeType: TrendType = 'appointments';
  @Output() typeChange = new EventEmitter<TrendType>();

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private viewReady = false;

  onTabChange(type: TrendType): void {
    if (type === this.activeType) return;
    this.activeType = type;
    this.typeChange.emit(type);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.viewReady) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    if (!this.data || !this.canvasRef) return;

    const labels = this.data.points.map((p) => p.label);
    const values = this.data.points.map((p) => p.value);
    const isRevenue = this.data.type === 'revenue';

    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: '#4338ca',
            backgroundColor: 'rgba(67, 56, 202, 0.08)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#4338ca',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                isRevenue
                  ? ` ${Number(ctx.parsed.y).toLocaleString('ar-EG')} ج.م`
                  : ` ${ctx.parsed.y} موعد`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            reverse: true, // عشان الشهور تتظبط اتجاه RTL زي التصميم
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
          },
        },
      },
    });
  }
}