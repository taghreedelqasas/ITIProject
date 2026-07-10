// dashboard/models/dashboard.models.ts

export interface KpiCard {
  value: number;
  changePercentage: number;
  comparisonLabel: string;
  comparisonValue: number;
}

export interface DashboardOverview {
  todayAppointments: KpiCard;
  totalAppointments: KpiCard;
  totalPatients: KpiCard;
  totalDoctors: KpiCard;
  completionRate: KpiCard;
  platformCommission: KpiCard;
  totalRevenue: KpiCard;
  activeConsultations: KpiCard;
}

export interface StatusSlice {
  status: string;
  label: string;
  count: number;
  percentage: number;
}

export interface AppointmentStatusDistribution {
  year: number;
  month: number;
  totalAppointments: number;
  completedPercentage: number;
  slices: StatusSlice[];
}

export interface MonthlyTrendPoint {
  year: number;
  month: number;
  label: string;
  value: number;
}

export interface MonthlyTrend {
  type: 'appointments' | 'revenue';
  points: MonthlyTrendPoint[];
}

export type TrendType = 'appointments' | 'revenue';

// شكل الداتا اللي بتتغذى بيها كل كارت KPI في الشاشة
export type IconKey =
  | 'clock'
  | 'calendar'
  | 'patients'
  | 'doctors'
  | 'check'
  | 'medal'
  | 'money'
  | 'chat';

export interface KpiCardViewModel {
  icon: IconKey;
  label: string;
  format: 'number' | 'currency' | 'percent';
  card: KpiCard;
}

