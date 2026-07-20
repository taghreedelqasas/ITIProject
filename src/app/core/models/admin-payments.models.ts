// src/app/core/models/admin-payments.models.ts
//
// مرآة كاملة للـ DTOs بتاعة الباك إند (Maw3ed.BLL/DTOs/AdminPayments/*.cs)
// أي تعديل في الباك على شكل الـ DTO لازم ينعكس هنا برضه.

import { KpiCardDto } from './admin-dashboard.models';

/** يقابل PaymentsSummaryDto.cs - كروت الـ 4 فوق شاشة "المدفوعات والعمولات" */
export interface PaymentsSummaryDto {
  pendingPayments: KpiCardDto;
  doctorsProfit: KpiCardDto;
  platformCommission: KpiCardDto;
  totalRevenue: KpiCardDto;
  /** نسبة العمولة الحالية (%) - بتتعرض جنب كارت "عمولة المنصة" */
  commissionRate: number;
}

/** يقابل CommissionRateDto.cs */
export interface CommissionRateDto {
  commissionRate: number;
  updatedAt: string;
  updatedBy: string | null;
}

/** يقابل UpdateCommissionRateDto.cs - جسم طلب PUT تعديل نسبة العمولة */
export interface UpdateCommissionRateDto {
  commissionRate: number;
}

/** يقابل RevenueCommissionPointDto.cs */
export interface RevenueCommissionPointDto {
  year: number;
  month: number;
  label: string; // اسم الشهر بالعربي جاهز من الباك
  revenue: number;
  commission: number;
}

/** يقابل RevenueCommissionTrendDto.cs */
export interface RevenueCommissionTrendDto {
  points: RevenueCommissionPointDto[];
}

/** الحالات الحقيقية الموجودة في PaymentStatus enum بالباك */
export type PaymentStatusValue = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

/** يقابل AdminTransactionDto.cs بالظبط */
export interface AdminTransactionDto {
  id: number;
  transactionCode: string; // "TX-1023"
  doctorName: string;
  patientName: string;
  consultationFee: number;
  commission: number;
  doctorNet: number;
  status: PaymentStatusValue;
  statusLabel: string; // بانتظار المراجعة / معتمد / مرفوض / مسترد
  createdAt: string;
}

/**
 * يقابل AdminTransactionsPagedResultDto.cs بالظبط.
 * ملحوظة: مفيش totalPages جاهز من الباك (على عكس مواعيد الأدمن) -
 * لازم يتحسب في الفرونت من totalCount / pageSize.
 */
export interface AdminTransactionsPagedResultDto {
  items: AdminTransactionDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
