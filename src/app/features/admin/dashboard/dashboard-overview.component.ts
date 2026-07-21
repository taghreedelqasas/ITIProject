import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { finalize } from 'rxjs';

import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';
import {
  AppointmentStatusDistributionDto,
  DashboardOverviewDto,
  MonthlyTrendDto,
  TrendType,
} from '../../../core/models/admin-dashboard.models';
import {
  formatCount,
  formatCurrencyCompact,
  formatPercentage,
} from '../../../core/utils/number-format.util';

type CardFormat = 'count' | 'percentage' | 'currency';
type CardIcon = 'clock' | 'calendar' | 'patients' | 'doctors' | 'check' | 'award' | 'money' | 'chat';

interface AiInsightView {
  label: string;
  value: string;
  note: string;
  tone: 'violet' | 'teal';
}

interface RecentActivityView {
  icon: 'doctor' | 'patient' | 'appointment' | 'cancel' | 'review' | 'payment';
  text: string;
  timeAgo: string;
}

interface KpiCardView {
  title: string;
  icon: CardIcon;
  valueText: string;
  changePercentage: number;
  comparisonLabel: string;
  comparisonValueText: string;
}

interface KpiCardConfig {
  key: keyof DashboardOverviewDto;
  title: string;
  icon: CardIcon;
  format: CardFormat;
}

const STATIC_AI_INSIGHTS: AiInsightView[] = [
  { label: 'أكثر تخصص مطلوب', value: 'طب القلب', note: '2,840 موعد هذا الشهر', tone: 'violet' },
  { label: 'أكثر طبيب نشاطًا', value: 'د. أحمد الزهراني', note: '184 موعد مكتمل', tone: 'teal' },
  { label: 'أكثر يوم ازدحامًا', value: 'الاثنين', note: 'معدل 284 موعد', tone: 'violet' },
  { label: 'معدل إلغاء المواعيد', value: '12.0%', note: 'انخفض 1.4% عن الشهر الماضي', tone: 'teal' },
  { label: 'نسبة نمو المنصة', value: '+22.5%', note: 'مقارنة بالشهر الماضي', tone: 'teal' },
];

const STATIC_TREND_MONTH_LABELS = [
  'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير',
  'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو',
];

// تعديل النقاط بحيث شهر يوليو (أخر قيمة) يوصل لـ 56 بالظبط
const STATIC_TREND_FALLBACK: Record<TrendType, MonthlyTrendDto> = {
  appointments: {
    type: 'appointments',
    points: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 56].map(
      (value, i) => ({ year: 2026, month: i + 1, label: STATIC_TREND_MONTH_LABELS[i], value })
    ),
  },
  revenue: {
    type: 'revenue',
    points: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 56].map(
      (value, i) => ({ year: 2026, month: i + 1, label: STATIC_TREND_MONTH_LABELS[i], value })
    ),
  },
};

const STATIC_RECENT_ACTIVITIES: RecentActivityView[] = [
  { icon: 'doctor', text: 'تسجيل طبيب جديد — د. محمد العتيبي (قلب وأوعية دموية)', timeAgo: 'منذ 5 دقائق' },
  { icon: 'patient', text: 'تسجيل مريض جديد — سارة الأحمدي', timeAgo: 'منذ 12 دقيقة' },
  { icon: 'appointment', text: 'حجز موعد جديد — د. فاروق المصري، الساعة 3:30 م', timeAgo: 'منذ 18 دقيقة' },
  { icon: 'cancel', text: 'إلغاء موعد — أحمد الشريف مع د. ليلى السعد', timeAgo: 'منذ 25 دقيقة' },
  { icon: 'review', text: 'تقييم جديد 5 نجوم — د. سارة إبراهيم', timeAgo: 'منذ 34 دقيقة' },
  { icon: 'payment', text: 'عملية دفع ناجحة — 450 ج.م (حجز موعد)', timeAgo: 'منذ 41 دقيقة' },
];

const KPI_CONFIG: KpiCardConfig[] = [
  { key: 'todayAppointments', title: 'مواعيد اليوم', icon: 'clock', format: 'count' },
  { key: 'totalAppointments', title: 'إجمالي المواعيد', icon: 'calendar', format: 'count' },
  { key: 'totalPatients', title: 'إجمالي المرضى', icon: 'patients', format: 'count' },
  { key: 'totalDoctors', title: 'إجمالي الأطباء', icon: 'doctors', format: 'count' },
  { key: 'completionRate', title: 'معدل الإتمام', icon: 'check', format: 'percentage' },
  { key: 'platformCommission', title: 'عمولة المنصة', icon: 'award', format: 'currency' },
  { key: 'totalRevenue', title: 'إجمالي الإيرادات', icon: 'money', format: 'currency' },
  { key: 'activeConsultations', title: 'الاستشارات النشطة', icon: 'chat', format: 'count' },
];

const SLICE_COLORS = ['#2DD4BF', '#6D28D9', '#F87171', '#FBBF24', '#60A5FA', '#F472B6'];

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard-overview.component.html',
})
export class DashboardOverviewComponent implements OnInit {
  loadingOverview = true;
  loadingDistribution = true;
  loadingTrend = true;

  overviewError = false;
  distributionError = false;
  trendError = false;

  kpiCards: KpiCardView[] = [];

  distribution: any = null;
  distributionChart: ApexOptions = {};
  sliceColors = SLICE_COLORS;

  trendType: TrendType = 'appointments';
  trendChart: ApexOptions = {};

  aiInsights: AiInsightView[] = STATIC_AI_INSIGHTS;
  recentActivities: RecentActivityView[] = STATIC_RECENT_ACTIVITIES;

  constructor(private readonly dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadOverview();
    this.loadDistribution();
    this.loadTrend();
  }

  private loadOverview(): void {
    this.loadingOverview = true;
    this.overviewError = false;

    this.dashboardService
      .getOverview()
      .pipe(finalize(() => (this.loadingOverview = false)))
      .subscribe({
        next: (overview) => (this.kpiCards = this.buildKpiCards(overview)),
        error: () => (this.overviewError = true),
      });
  }

  private loadDistribution(): void {
    this.loadingDistribution = true;
    this.distributionError = false;

    // تم تغيير القيم نهائياً وتخصيص نسبة لكل حالة بدلاً من 50%
    const mockDistribution: any = {
      completedPercentage: 45,
      slices: [
        { status: 'مكتمل', count: 45, label: 'مكتمل', percentage: 45 },
        { status: 'قيد الانتظار', count: 25, label: 'قيد الانتظار', percentage: 25 },
        { status: 'مؤكد', count: 20, label: 'مؤكد', percentage: 20 },
        { status: 'ملغي', count: 10, label: 'ملغي', percentage: 10 },
      ],
    };

    // نستخدم البيانات المتنوعة مباشرة للعرض
    this.distribution = mockDistribution;
    this.distributionChart = this.buildDonutOptions(mockDistribution);
    this.loadingDistribution = false;
  }

  onTrendTypeChange(type: TrendType): void {
    if (this.trendType === type) return;
    this.trendType = type;
    this.loadTrend();
  }

  private loadTrend(): void {
    this.loadingTrend = true;
    this.trendError = false;

    // عرض بيانات الـ Fallback مباشرة التي تجعل منحنى شهر يوليو يلامس 56
    this.trendChart = this.buildTrendOptions(STATIC_TREND_FALLBACK[this.trendType]);
    this.loadingTrend = false;
  }

  private buildKpiCards(overview: DashboardOverviewDto): KpiCardView[] {
    return KPI_CONFIG.map((config) => {
      const card = overview[config.key];
      return {
        title: config.title,
        icon: config.icon,
        valueText: this.formatByType(card.value, config.format),
        changePercentage: card.changePercentage,
        comparisonLabel: card.comparisonLabel,
        comparisonValueText: this.formatByType(card.comparisonValue, config.format),
      };
    });
  }

  private formatByType(value: number, format: CardFormat): string {
    switch (format) {
      case 'percentage':
        return formatPercentage(value);
      case 'currency':
        return formatCurrencyCompact(value);
      default:
        return formatCount(value);
    }
  }

  private buildDonutOptions(dist: any): ApexOptions {
    const slices = dist.slices || [];
    return {
      chart: { type: 'donut', height: 260 },
      labels: slices.map((s: any) => s.label ?? s.status),
      series: slices.map((s: any) => s.percentage ?? s.count),
      colors: SLICE_COLORS,
      dataLabels: { enabled: false },
      legend: { show: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              value: {
                fontSize: '28px',
                fontWeight: 800,
                color: '#1e293b',
                offsetY: -4,
                formatter: () => `${dist.completedPercentage}%`,
              },
              name: {
                show: true,
                fontSize: '13px',
                color: '#94a3b8',
                offsetY: 8,
                formatter: () => 'مكتمل',
              },
              total: {
                show: true,
                label: 'مكتمل',
                formatter: () => `${dist.completedPercentage}%`,
              },
            },
          },
        },
      },
    };
  }

  private buildTrendOptions(trend: MonthlyTrendDto): ApexOptions {
    return {
      chart: { type: 'area', height: 300, toolbar: { show: false }, fontFamily: 'Cairo, sans-serif' },
      series: [
        {
          name: trend.type === 'revenue' ? 'الإيرادات' : 'المواعيد',
          data: trend.points.map((p) => p.value),
        },
      ],
      xaxis: {
        categories: trend.points.map((p) => p.label),
        labels: { style: { colors: '#94a3b8' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        max: 56, // أقصى ارتفاع للمحور هو 56
        labels: { style: { colors: '#94a3b8' } },
      },
      colors: ['#6D28D9'],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] },
      },
      dataLabels: { enabled: false },
      grid: { borderColor: '#f1f5f9' },
      tooltip: { theme: 'light' },
    };
  }
}
