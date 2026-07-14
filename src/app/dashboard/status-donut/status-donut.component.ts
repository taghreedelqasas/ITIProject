// dashboard/status-donut/status-donut.component.ts
// يتطلب: npm install chart.js

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AppointmentStatusDistribution } from '../models/dashboard.models';

Chart.register(...registerables);

// ألوان الشرائح بنفس ترتيب الحالات القادمة من الـ API
const SLICE_COLORS: Record<string, string> = {
  Completed: '#2dd4bf', // مكتمل - تركواز
  Pending: '#312e81', // قيد الانتظار - كحلي غامق
  Confirmed: '#f43f5e', // مؤكد - أحمر
  Cancelled: '#f59e0b', // ملغي - برتقالي
};

@Component({
  selector: 'app-status-donut',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5" dir="rtl">
      <div class="mb-4">
        <h3 class="font-bold text-gray-800">توزيع حالات المواعيد</h3>
        <p class="text-xs text-gray-400 mt-0.5" *ngIf="data">
          {{ monthLabel }}
        </p>
      </div>

      <div class="flex items-center gap-6">
        <div class="relative w-40 h-40 shrink-0">
          <canvas #canvas></canvas>
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span class="text-2xl font-bold text-gray-900">
              {{ data?.completedPercentage ?? 0 }}%
            </span>
            <span class="text-xs text-gray-400">مكتمل</span>
          </div>
        </div>

        <ul class="flex-1 space-y-2">
          <li
            *ngFor="let slice of data?.slices"
            class="flex items-center justify-between text-sm"
          >
            <span class="flex items-center gap-2 text-gray-600">
              <span
                class="w-2.5 h-2.5 rounded-full"
                [style.background]="colorFor(slice.status)"
              ></span>
              {{ slice.label }}
            </span>
            <span class="font-semibold text-gray-800">{{ slice.percentage }}%</span>
          </li>
        </ul>
      </div>
    </div>
  `,
})
export class StatusDonutComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: AppointmentStatusDistribution | null = null;

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private viewReady = false;

  get monthLabel(): string {
    if (!this.data) return '';
    return `${this.data.year}`;
  }

  colorFor(status: string): string {
    return SLICE_COLORS[status] ?? '#94a3b8';
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

    const labels = this.data.slices.map((s) => s.label);
    const values = this.data.slices.map((s) => s.count);
    const colors = this.data.slices.map((s) => this.colorFor(s.status));

    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        cutout: '72%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
            },
          },
        },
      },
    });
  }
}