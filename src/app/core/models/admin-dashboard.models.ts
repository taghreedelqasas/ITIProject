// src/app/core/models/admin-dashboard.models.ts
//
// مرآة كاملة للـ DTOs بتاعة الباك إند (Maw3ed.BLL/DTOs/AdminDashboard/*.cs)
// أي تعديل في الباك على شكل الـ DTO لازم ينعكس هنا برضه.

/** يقابل KpiCardDto.cs */
export interface KpiCardDto {
  value: number;
  changePercentage: number;
  comparisonLabel: string;
  comparisonValue: number;
}

/** يقابل DashboardOverviewDto.cs — الكروت الـ 8 في نظرة عامة */
export interface DashboardOverviewDto {
  todayAppointments: KpiCardDto;
  totalAppointments: KpiCardDto;
  totalPatients: KpiCardDto;
  totalDoctors: KpiCardDto;
  completionRate: KpiCardDto;
  platformCommission: KpiCardDto;
  totalRevenue: KpiCardDto;
  activeConsultations: KpiCardDto;
}

/** يقابل StatusSliceDto.cs */
export interface StatusSliceDto {
  status: string; // Completed / Pending / Confirmed / Cancelled ... (زي ما الباك بيرجعها فعليًا)
  label: string; // النص العربي جاهز من الباك
  count: number;
  percentage: number;
}

/** يقابل AppointmentStatusDistributionDto.cs */
export interface AppointmentStatusDistributionDto {
  year: number;
  month: number;
  totalAppointments: number;
  completedPercentage: number;
  slices: StatusSliceDto[];
}

/** يقابل MonthlyTrendPointDto.cs */
export interface MonthlyTrendPointDto {
  year: number;
  month: number;
  label: string;
  value: number;
}

/** يقابل MonthlyTrendDto.cs */
export interface MonthlyTrendDto {
  type: 'appointments' | 'revenue';
  points: MonthlyTrendPointDto[];
}

/** الأنواع المسموحة لـ query param "type" في /dashboard/monthly-trend — نفس ما بيتحقق منه الباك */
export type TrendType = 'appointments' | 'revenue';

/**
 * يقابل AdminPatientDto.cs بالظبط.
 * ملحوظة: مفيش رقم هاتف، مفيش تاريخ آخر حجز، ومفيش حالة حساب (نشط/موقوف) في الـ DTO ده -
 * لو حبيتوا تضيفوهم في التصميم، لازم يتضافوا في الباك الأول.
 */
export interface AdminPatientDto {
  id: number;
  fullName: string;
  email: string;
  profilePictureUrl: string | null;
  totalAppointments: number;
}

/** الحالات الحقيقية الموجودة في DoctorVerificationStatus enum بالباك */
export type DoctorVerificationStatusValue = 'Pending' | 'Approved' | 'Rejected';

/** يقابل AdminDoctorDto.cs بالظبط (بعد التوسعة لشاشة إدارة الأطباء) */
export interface AdminDoctorDto {
  id: number;
  fullName: string;
  department: string;
  address: string;
  profilePictureUrl: string | null;
  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
  revenue: number;
  joinedAt: string; // "yyyy-MM-dd"
  verificationStatus: DoctorVerificationStatusValue;
  verificationStatusLabel: string;
  isActive: boolean;
  accountStatusLabel: string;
}

/** يقابل DoctorsOverviewDto.cs بالظبط - كروت الـ KPI الـ 6 فوق شاشة إدارة الأطباء */
export interface DoctorsOverviewDto {
  totalBookings: KpiCardDto;
  averageRating: KpiCardDto;
  suspendedDoctors: KpiCardDto;
  pendingApproval: KpiCardDto; // ملحوظة: comparisonValue هنا عدد مطلق مش نسبة
  activeDoctors: KpiCardDto;
  totalDoctors: KpiCardDto;
}

/**
 * يقابل DoctorPendingDto.cs (DAL) بالظبط - نفس الشكل اللي بيرجعه GetPendingDoctorsAsync.
 * المستندات التلاتة اللي شايفينها في شاشة "طلبات الاعتماد المعلقة" (البطاقة / رخصة مزاولة
 * المهنة / شهادة المؤهل) بتيجي من ssnImg / licenseImage / certificateImage بالظبط.
 */
export interface DoctorPendingDto {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseImage: string | null; // رخصة مزاولة المهنة
  ssnImg: string | null; // البطاقة (الرقم القومي)
  certificateImage: string | null; // شهادة المؤهل
  certificate: string;
  isVerified: boolean;
  consultationFee: number;
  address: string;
  graduationDate: string;
  departmentId: number;
  registeredAt: string;
}

/** الحالات الحقيقية الموجودة في AppointmentStatus enum بالباك - "مؤجلة" مش موجودة خالص */
export type AppointmentStatusValue = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

/** يقابل AdminAppointmentDto.cs بالظبط */
export interface AdminAppointmentDto {
  id: number;
  bookingNumber: string;
  doctorName: string;
  patientName: string;
  fee: number;
  date: string; // "yyyy-MM-dd" جاهز من الباك
  time: string; // "10:00 ص" جاهز من الباك
  status: AppointmentStatusValue;
  statusLabel: string;
}

/** يقابل AdminAppointmentsPagedResultDto.cs بالظبط */
export interface AdminAppointmentsPagedResultDto {
  items: AdminAppointmentDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** يقابل AdminAppointmentsSummaryDto.cs بالظبط - مفيش "مؤجلة" لأنها مش موجودة في الباك */
export interface AdminAppointmentsSummaryDto {
  todayBookings: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

/** يقابل AdminMedicalFileDto.cs بالظبط */
export interface AdminMedicalFileDto {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string; // "PDF" / "JPEG" ...
  categoryLabel: string;
  uploadedAt: string; // "yyyy-MM-dd"
}

/**
 * يقابل AdminPatientDetailDto.cs بالظبط.
 * ملحوظة: مفيش "عنوان" - مش موجود في الباك. medicalHistory نص حر مش Array منظم.
 */
export interface AdminPatientDetailDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  profilePictureUrl: string | null;
  gender: string; // "ذكر" / "أنثى" / "غير محدد"
  age: number;
  registeredAt: string; // "yyyy-MM-dd"
  isActive: boolean;
  medicalHistory: string | null;
  medicalFiles: AdminMedicalFileDto[];
}

/** يقابل AdminDoctorDetailDto.cs بالظبط */
export interface AdminDoctorDetailDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  profilePictureUrl: string | null;
  gender: string;
  age: number;
  registeredAt: string;
  isActive: boolean;
  department: string;
  address: string;
  licenseNumber: string;
  consultationFee: number;
  graduationDate: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
}
