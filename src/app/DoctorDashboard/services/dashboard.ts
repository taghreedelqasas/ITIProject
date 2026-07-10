// ============================================================
// src/app/models/dashboard.models.ts
// ============================================================

// شكل عام لكل رد بييجي من الـ Backend
export interface ServiceResult<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================
// 1) حقيقي 100% — Doctor
// ============================================================
export interface DoctorReadDto {
  id: number;
  licenseNumber: string;
  consultationFee: number;
  address: string;
  isVerified: boolean;
  departmentName: string;
  userName: string;
  imageProfile: string | null;
}

export interface DoctorUpdateDto {
  id: number;
  licenseNumber?: string;
  certificate?: string;
  consultationFee?: number;
  address?: string;
  graduationDate?: string; // ISO date
  departmentId?: number;
  imageProfile?: string;
}

// ============================================================
// 2) حقيقي 100% — UserProfile
// ⚠️ شكل الـ GET غير موثّق بالكامل، تأكدي منه أول استدعاء فعلي
// ============================================================
export enum  Gender  {
  Male = 0 ,
  Female = 1 
};

export interface UserProfile {
  
  fullName: string;
  email: string;
  phoneNumber: string | null;
  birthDate: string | null;
  gender: Gender | null;
  profilePictureUrl: string | null;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: Gender;
}

// ============================================================
// 3) حقيقي 100% — Appointments
// ============================================================
export interface AppointmentApi {
  id: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  notes: string | null;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  slotStart: string; // ISO date-time
  slotEnd: string;
  createdAt: string;
}

export interface AvailableSlotApi {
  availabilityId: number;
  startTime: string; // ISO date-time
  endTime: string;
}

// ============================================================
// 4) على الأغلب حقيقي — Reviews (⚠️ شكل الرد غير موثّق بالكامل)
// ============================================================
export interface ReviewApi {
  id: number;
  patientName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

// ============================================================
// 5) حقيقي 100% — Wallet & Payments
// ============================================================
export interface WalletResponse {
  balance: number;
  pendingBalance: number;
  updatedAt: string;
}

export interface WalletTransactionApi {
  id: number;
  appointmentId: number | null;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

export interface WithdrawRequestPayload {
  amount: number;
  method: string;
  accountNumber: string;
}

export interface PaymentInitiateResponse {
  paymentId: number;
  iframeUrl: string;
}

// ============================================================
// 6) ⚠️ وهمية مؤقتًا — لا يوجد Backend حقيقي لها بعد
// ============================================================
export interface ConversationApi {
  id: number;
  patientId: number;
  patientName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface MessageApi {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface SendMessageDto {
  content: string;
}
export interface AnalyticsStats {
  averageRating: number;
  totalPatients: number;
  totalAppointments: number;
  totalConsultations: number;
  attendanceRate: number;
  cancellationRate: number;
  monthlyEarnings: { month: string; amount: number }[];
  patientGrowth: { month: string; count: number }[];
  mostActiveDay: string;
  mostActiveTime: string;
  attendanceChangeRate: string;
}

export interface DoctorSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  websiteNotifications: boolean;
  appointmentReminder: boolean;
  showPhoneNumber: boolean;
  lockConsultations: boolean;
}

// مريض مُشتق من المواعيد — الاسم والعدد حقيقي، الباقي وهمي مؤقتًا
export interface PatientDerived {
  id: number;
  name: string;
  appointmentsCount: number;
  lastAppointment: string;
  lastStatus: string;
  gender: string;  // ⚠️ وهمي
  age: number;     // ⚠️ وهمي
  phone: string;   // ⚠️ وهمي
}