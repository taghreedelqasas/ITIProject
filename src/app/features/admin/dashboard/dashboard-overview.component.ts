// src/app/features/admin/dashboard/dashboard-overview.component.ts
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

// ---------------------------------------------------------------------------
// ملحوظة مهمة: القسمين دول ("ملخص الأداء الذكي" و "آخر الأنشطة") مفيش لهم
// أي endpoint في الباك حاليًا (مفيش AI insights service ولا activity-feed/audit-log
// في AdminController أو IAdminDashboardService). عشان كده بيتعرضوا هنا كبيانات
// Static/Mock ثابتة في الفرونت بس عشان التصميم يطابق الصورة المطلوبة،
// ولازم يتستبدلوا ببيانات حقيقية أول ما الباك يوفر الـ endpoints دي.
// ---------------------------------------------------------------------------
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

// Static mock - مفيش endpoint AI insights في الباك حاليًا
const STATIC_AI_INSIGHTS: AiInsightView[] = [
  { label: 'أكثر تخصص مطلوب', value: 'طب القلب', note: '2,840 موعد هذا الشهر', tone: 'violet' },
  { label: 'أكثر طبيب نشاطًا', value: 'د. أحمد الزهراني', note: '184 موعد مكتمل', tone: 'teal' },
  { label: 'أكثر يوم ازدحامًا', value: 'الاثنين', note: 'معدل 284 موعد', tone: 'violet' },
  { label: 'معدل إلغاء المواعيد', value: '12.0%', note: 'انخفض 1.4% عن الشهر الماضي', tone: 'teal' },
  { label: 'نسبة نمو المنصة', value: '+22.5%', note: 'مقارنة بالشهر الماضي', tone: 'teal' },
];

// Static mock fallback - بيتستخدم بس لو الباك رجّع error أو بيانات فاضية لـ monthly-trend
// (عشان الجراف مايفضلش فاضي زي ما كان بيحصل). أول ما endpoint /monthly-trend يشتغل صح
// هيتم تجاهل الـ fallback ده تلقائيًا لأن buildTrendOptions هتاخد بيانات الباك الحقيقية.
const STATIC_TREND_MONTH_LABELS = [
  'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير',
  'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو',
];

const STATIC_TREND_FALLBACK: Record<TrendType, MonthlyTrendDto> = {
  appointments: {
    type: 'appointments',
    points: [980, 1120, 1050, 1240, 1380, 1290, 1460, 1510, 1420, 1600, 1720, 1840].map(
      (value, i) => ({ year: 2025, month: i + 1, label: STATIC_TREND_MONTH_LABELS[i], value })
    ),
  },
  revenue: {
    type: 'revenue',
    points: [42000, 48500, 45200, 53800, 59700, 55900, 63200, 65800, 61500, 69300, 74600, 79800].map(
      (value, i) => ({ year: 2025, month: i + 1, label: STATIC_TREND_MONTH_LABELS[i], value })
    ),
  },
};

// Static mock - مفيش endpoint activity-feed / audit-log في الباك حاليًا
const STATIC_RECENT_ACTIVITIES: RecentActivityView[] = [
  { icon: 'doctor', text: 'تسجيل طبيب جديد — د. محمد العتيبي (قلب وأوعية دموية)', timeAgo: 'منذ 5 دقائق' },
  { icon: 'patient', text: 'تسجيل مريض جديد — سارة الأحمدي', timeAgo: 'منذ 12 دقيقة' },
  { icon: 'appointment', text: 'حجز موعد جديد — د. فاروق المصري، الساعة 3:30 م', timeAgo: 'منذ 18 دقيقة' },
  { icon: 'cancel', text: 'إلغاء موعد — أحمد الشريف مع د. ليلى السعد', timeAgo: 'منذ 25 دقيقة' },
  { icon: 'review', text: 'تقييم جديد 5 نجوم — د. سارة إبراهيم', timeAgo: 'منذ 34 دقيقة' },
  { icon: 'payment', text: 'عملية دفع ناجحة — 450 ج.م (حجز موعد)', timeAgo: 'منذ 41 دقيقة' },
];

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

// ترتيب وتنسيق الكروت الـ 8 - المفاتيح مطابقة تمامًا لحقول DashboardOverviewDto
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

// بالتة ألوان للدونات - بتتلف على أي عدد Slices يرجعه الباك (مش مربوطة بعدد ثابت)
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

  distribution: AppointmentStatusDistributionDto | null = null;
  distributionChart: ApexOptions = {};
  sliceColors = SLICE_COLORS;

  trendType: TrendType = 'appointments';
  trendChart: ApexOptions = {};

  // Static/Mock - راجع الملحوظة فوق KPI_CONFIG: مفيش endpoints للقسمين دول في الباك لسه
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

    // من غير year/month عشان الباك ياخد الشهر الحالي تلقائيًا
    this.dashboardService
      .getAppointmentsDistribution()
      .pipe(finalize(() => (this.loadingDistribution = false)))
      .subscribe({
        next: (dist) => {
          this.distribution = dist;
          this.distributionChart = this.buildDonutOptions(dist);
        },
        error: () => (this.distributionError = true),
      });
  }

  onTrendTypeChange(type: TrendType): void {
    if (this.trendType === type) return;
    this.trendType = type;
    this.loadTrend();
  }

  private loadTrend(): void {
    this.loadingTrend = true;
    this.trendError = false;

    this.dashboardService
      .getMonthlyTrend(this.trendType, 12)
      .pipe(finalize(() => (this.loadingTrend = false)))
      .subscribe({
        // لو الباك رجّع بيانات فاضية (points.length === 0) بنستخدم fallback ثابت
        // بدل ما الجراف يفضل فاضي من غير أي رسم
        next: (trend) => {
          const hasData = !!trend?.points?.length;
          this.trendChart = this.buildTrendOptions(hasData ? trend : STATIC_TREND_FALLBACK[this.trendType]);
        },
        // نفس الفكرة لو الـ request فشل تمامًا (endpoint مش شغال دلوقتي) -
        // بنعرض بيانات ثابتة بدل ما نسيب المستخدم مش شايف أي رسم بياني خالص
        error: () => {
          this.trendError = false;
          this.trendChart = this.buildTrendOptions(STATIC_TREND_FALLBACK[this.trendType]);
        },
      });
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

  // مبني ديناميكيًا من distribution.slices اللي راجعة من الباك - مش متفترض شكل ثابت
  // (ده اللي بيحل مشكلة "لم يحضر" في التصميم مقابل "مؤكد" الفعلية في الباك)
  private buildDonutOptions(dist: AppointmentStatusDistributionDto): ApexOptions {
    return {
      chart: { type: 'donut', height: 260 },
      labels: dist.slices.map((s) => s.label),
      series: dist.slices.map((s) => s.percentage),
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
      yaxis: { labels: { style: { colors: '#94a3b8' } } },
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
