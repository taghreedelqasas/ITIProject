// dashboard/dashboard.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { KpiCardComponent } from './kpi-card/kpi-card.component';
import { StatusDonutComponent } from './status-donut/status-donut.component';
import { MonthlyTrendChartComponent } from './monthly-trend-chart/monthly-trend-chart.component';
import {
  AppointmentStatusDistribution,
  DashboardOverview,
  MonthlyTrend,
  TrendType,
} from './models/dashboard.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardComponent,
    StatusDonutComponent,
    MonthlyTrendChartComponent,
  ],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">

      <aside class="w-72 bg-purple-900 text-white flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          <div class="flex items-center gap-2 px-4 py-6 border-b border-purple-800">
            <span class="text-2xl">📅</span>
            <h1 class="text-xl font-bold tracking-wide">Maw3ed <span class="text-cyan-400">موعد</span></h1>
          </div>
          <nav class="mt-6 space-y-1">
            <a class="flex items-center gap-4 px-4 py-3 bg-white text-purple-900 rounded-xl font-bold shadow-sm cursor-pointer">
              <span>📊</span> نظرة عامة
            </a>
            <a class="flex items-center gap-4 px-4 py-3 text-purple-200 hover:bg-purple-800 rounded-xl transition cursor-pointer">
              <span>👥</span> إدارة المرضى
            </a>
            <a class="flex items-center gap-4 px-4 py-3 text-purple-200 hover:bg-purple-800 rounded-xl transition cursor-pointer">
              <span>🩺</span> إدارة الأطباء
            </a>
            <a class="flex items-center gap-4 px-4 py-3 text-purple-200 hover:bg-purple-800 rounded-xl transition cursor-pointer">
              <span>📅</span> إدارة المواعيد
            </a>
            <a class="flex items-center gap-4 px-4 py-3 text-purple-200 hover:bg-purple-800 rounded-xl transition cursor-pointer">
              <span>💰</span> المدفوعات والعمولات
            </a>

          </nav>
        </div>
        
      </aside>

      <div class="flex-1 flex flex-col overflow-y-auto">
        
       

        <main class="p-8 space-y-6">
          
          <div class="text-right">
            <h1 class="text-2xl font-bold text-gray-900">نظرة عامة</h1>
            <p class="text-sm text-gray-500 mt-1">مؤشرات الأداء الرئيسية — يوليو 2026</p>
          </div>

          <div *ngIf="loadingOverview()" class="text-center text-gray-400 py-10">
            جاري تحميل البيانات...
          </div>

          <ng-container *ngIf="overview() as ov">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <app-kpi-card
                label="مواعيد اليوم"
                icon="clock"
                format="number"
                [card]="ov.todayAppointments"
              ></app-kpi-card>

              <app-kpi-card
                label="إجمالي المواعيد"
                icon="calendar"
                format="number"
                [card]="ov.totalAppointments"
              ></app-kpi-card>

              <app-kpi-card
                label="إجمالي المرضى"
                icon="patients"
                format="number"
                [card]="ov.totalPatients"
              ></app-kpi-card>

              <app-kpi-card
                label="إجمالي الأطباء"
                icon="doctors"
                format="number"
                [card]="ov.totalDoctors"
              ></app-kpi-card>

              <app-kpi-card
                label="معدل الإتمام"
                icon="check"
                format="percent"
                [card]="ov.completionRate"
              ></app-kpi-card>

              <app-kpi-card
                label="عمولة المنصة"
                icon="medal"
                format="currency"
                [card]="ov.platformCommission"
              ></app-kpi-card>

              <app-kpi-card
                label="إجمالي الإيرادات"
                icon="money"
                format="currency"
                [card]="ov.totalRevenue"
              ></app-kpi-card>

              <app-kpi-card
                label="الاستشارات النشطة"
                icon="chat"
                format="number"
                [card]="ov.activeConsultations"
              ></app-kpi-card>
            </div>
          </ng-container>

          <section class="mt-8">
            <div class="mb-4 text-right">
              <h2 class="text-lg font-bold text-gray-800">تحليلات المنصة</h2>
              <p class="text-sm text-gray-400">اتجاهات الأداء خلال آخر 12 شهرًا</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-1">
                <app-status-donut [data]="distribution()"></app-status-donut>
              </div>

              <div class="lg:col-span-2">
                <app-monthly-trend-chart
                  [data]="trend()"
                  [activeType]="activeTrendType()"
                  (typeChange)="onTrendTypeChange($event)"
                ></app-monthly-trend-chart>
              </div>
            </div>
          </section>

        </main>
      </div>

    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  overview = signal<DashboardOverview | null>(null);
  distribution = signal<AppointmentStatusDistribution | null>(null);
  trend = signal<MonthlyTrend | null>(null);

  activeTrendType = signal<TrendType>('appointments');
  loadingOverview = signal(false);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadOverview();
    this.loadDistribution();
    this.loadTrend(this.activeTrendType());
  }

  loadOverview(): void {
    this.loadingOverview.set(true);
    this.dashboardService
      .getOverview()
      .pipe(finalize(() => this.loadingOverview.set(false)))
      .subscribe((data) => this.overview.set(data));
  }

  loadDistribution(): void {
    this.dashboardService
      .getAppointmentsDistribution()
      .subscribe((data) => this.distribution.set(data));
  }

  loadTrend(type: TrendType): void {
    this.dashboardService
      .getMonthlyTrend(type, 12)
      .subscribe((data) => this.trend.set(data));
  }

  onTrendTypeChange(type: TrendType): void {
    this.activeTrendType.set(type);
    this.loadTrend(type);
  }
}