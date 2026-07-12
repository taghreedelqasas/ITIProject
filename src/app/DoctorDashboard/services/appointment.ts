
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ServiceResult,
  DoctorReadDto,
  DoctorUpdateDto,
  UserProfile,
  UpdateProfileDto,
  AppointmentApi,
  AvailableSlotApi,
  CreateDoctorAvailabilityDto,
  UpdateDoctorAvailabilityDto,
  ReviewApi,
  WalletResponse,
  WalletTransactionApi,
  WithdrawRequestPayload,
  PaymentInitiateResponse,
  MessageApi,
  ConversationApi,
  AnalyticsStats,
  DoctorSettings,
  PatientDerived
} from './dashboard';

const BASE = 'https://mawed.runasp.net';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);

  loading = signal<boolean>(false);

  // ============================================================
  // 1) Doctor + UserProfile — حقيقي
  // ============================================================
  doctor = signal<DoctorReadDto | null>(null);
  userProfile = signal<UserProfile | null>(null);
 conversations = signal<ConversationApi[]>([]);
activeConversationId = signal<number | null>(null);
activeMessages = signal<MessageApi[]>([]);
newMessageText = signal<string>('');

  getDoctorById(id: number): void {
    this.http.get<DoctorReadDto>(`${BASE}/api/Doctor/${id}`).subscribe({
      next: (res) =>{ this.doctor.set(res)
         console.log(res);
         
      }
      ,
      error: (err) => console.error('Error fetching doctor:', err)
    });
  }

  updateDoctorProfile(payload: DoctorUpdateDto) {
    return this.http.put<ServiceResult<null>>(`${BASE}/api/Doctor/${payload.id}`, payload);
  }
getUserProfile() {
  return this.http.get<UserProfile>(`${BASE}/api/UserProfile`);
}


updateUserProfile(payload: UpdateProfileDto) {
  return this.http.patch(`${BASE}/api/UserProfile`, payload, { responseType: 'text' as 'json' });
}

  uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ServiceResult<null>>(`${BASE}/api/UserProfile/picture`, formData);
  }

  // ============================================================
  // 2) Appointments — حقيقي
  // ============================================================
  appointments = signal<AppointmentApi[]>([]);
  selectedStatusFilter = signal<string>('الكل');
  availableSlots = signal<AvailableSlotApi[]>([]);

  loadDashboardData(): void {
    this.loading.set(true);
    this.getDoctorAppointments();
    this.getMyReviews();
    this.getDoctorConversations(); 
  }

 getDoctorAppointments(): void {
  this.http.get<AppointmentApi[]>(`${BASE}/api/Appointments/doctor/my`).subscribe({
    next: (res) =>{ this.appointments.set(res)
      console.log(res);
    },
    error: (err) => {
      console.error('Error fetching appointments:', err);
      this.appointments.set([]);
    },
    complete: () => this.loading.set(false)
  });
}

  getAvailableSlots(doctorId: number): void {
    this.http.get<ServiceResult<AvailableSlotApi[]>>(`${BASE}/api/DoctorAvailability/doctor/${doctorId}/available`).subscribe({
next: (res) => {
  this.availableSlots.set(res.data ?? []);
},      error: (err) => console.error('Error fetching available slots:', err)
    });
  }

  getDoctorAvailability(doctorId: number) {
  return this.http.get<ServiceResult<AvailableSlotApi[]>>(
    `${BASE}/api/DoctorAvailability/doctor/${doctorId}`
  );
}

createAvailability(body: CreateDoctorAvailabilityDto) {
  return this.http.post(
    `${BASE}/api/DoctorAvailability`,
    body
  );
}

updateAvailability(
  id: number,
  body: UpdateDoctorAvailabilityDto
) {
  return this.http.put(
    `${BASE}/api/DoctorAvailability/${id}`,
    body
  );
}

deleteAvailability(id: number) {
  return this.http.delete(
    `${BASE}/api/DoctorAvailability/${id}`
  );
}

getAvailabilityById(id: number) {
  return this.http.get<ServiceResult<AvailableSlotApi>>(
    `${BASE}/api/DoctorAvailability/${id}`
  );
}

  confirmAppointment(id: number) {
    return this.http.patch<ServiceResult<null>>(`${BASE}/api/Appointments/${id}/confirm`, {});
  }

  completeAppointment(id: number) {
    return this.http.patch<ServiceResult<null>>(`${BASE}/api/Appointments/${id}/complete`, {});
  }

  cancelAppointment(id: number) {
    return this.http.delete<ServiceResult<null>>(`${BASE}/api/Appointments/${id}/cancel`);
  }

  rescheduleAppointment(id: number, newDoctorAvailabilityId: number) {
    return this.http.put<ServiceResult<null>>(`${BASE}/api/Appointments/${id}/reschedule`, { newDoctorAvailabilityId });
  }

  filteredAppointments = computed(() => {
    const all = this.appointments();
    const filter = this.selectedStatusFilter();
    if (filter === 'الكل') return all;
    const statusMap: { [key: string]: string } = {
      'حضر': 'Completed',
      'قادم': 'Confirmed',
      'لم يحضر': 'Cancelled',
      'في الانتظار': 'Pending'
    };
    return all.filter(a => a.status === statusMap[filter]);
  });

  totalAppointmentsCount = computed(() => this.appointments().length);

  // مرضى مُشتقين من المواعيد — الاسم والعدد حقيقي، الباقي وهمي مؤقتًا
  uniquePatients = computed<PatientDerived[]>(() => {
    const all = this.appointments();
    const map = new Map<number, PatientDerived>();
    for (const appt of all) {
      const existing = map.get(appt.patientId);
      if (existing) {
        existing.appointmentsCount++;
        if (new Date(appt.slotStart) > new Date(existing.lastAppointment)) {
          existing.lastAppointment = appt.slotStart;
          existing.lastStatus = appt.status;
        }
      } else {
        map.set(appt.patientId, {
          id: appt.patientId,
          name: appt.patientName,
          appointmentsCount: 1,
          lastAppointment: appt.slotStart,
          lastStatus: appt.status,
          gender: '—',
          age: 0,
          phone: '—'
        });
      }
    }
    return Array.from(map.values());
  });

  // ============================================================
  // 3) Reviews — على الأغلب حقيقي
  // ============================================================
  reviews = signal<ReviewApi[]>([]);

 getMyReviews(): void {
  this.http.get<ServiceResult<ReviewApi[]>>(`https://mawed.runasp.net/api/Reviews/my`).subscribe({
    next: (res) => this.reviews.set(res.data ?? []),
    error: (err) => {
      console.error('Error fetching reviews:', err);
      this.reviews.set([]);
    }
  });
}
  averageRating = computed(() => {
    const list = this.reviews();
    if (list.length === 0) return '0.0';
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return (sum / list.length).toFixed(1);
  });

  // ============================================================
  // 4) Wallet & Payments — حقيقي بالكامل
  // ============================================================
  wallet = signal<WalletResponse | null>(null);
  walletTransactions = signal<WalletTransactionApi[]>([]);

getWallet(): void {
  this.http.get<ServiceResult<WalletResponse>>(`https://mawed.runasp.net/api/wallet`).subscribe({
    next: (res) => this.wallet.set(res.data ?? null),
    error: (err) => {
      console.error('Error fetching wallet:', err);
      this.wallet.set(null);
    }
  });
}

 getWalletTransactions(): void {
  this.http.get<ServiceResult<WalletTransactionApi[]>>(`${BASE}/api/wallet/transactions`).subscribe({
    next: (res) => this.walletTransactions.set(res.data ?? []),
    error: (err) => {
      console.error('Error fetching transactions:', err);
      this.walletTransactions.set([]);
    }
  });
}
  sendWithdrawRequest(payload: WithdrawRequestPayload) {
    return this.http.post<ServiceResult<null>>(`${BASE}/api/wallet/withdraw`, payload);
  }

  initiatePayment(appointmentId: number) {
    return this.http.post<ServiceResult<PaymentInitiateResponse>>(
      `${BASE}/api/payments/initiate/${appointmentId}`, {}
    );
  }

  // دخل الشهر — محسوب من بيانات حقيقية (حركات Credit في الشهر الحالي)
  monthlyEarnings = computed(() => {
    const now = new Date();
    return this.walletTransactions()
      .filter(t => t.type === 'Credit'
                && new Date(t.createdAt).getMonth() === now.getMonth()
                && new Date(t.createdAt).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + t.amount, 0);
  });

  // ============================================================
  // 5) ⚠️ وهمية مؤقتًا — لا يوجد Backend حقيقي لها بعد
  // ============================================================


// شيلي كل جزء consultations/consultationStats/updateConsultationStatus القديم، وحطي بدالهم:

// curl https://mawed.runasp.net/api/Conversation/doctor-conversations

getDoctorConversations(): void {
  this.http.get<ConversationApi[]>(`${BASE}/api/Conversation/doctor-conversations`).subscribe({
    next: (res) => {this.conversations.set(res)
      console.log(res)
    }
    ,
    error: (err) => {
      console.error('Error fetching conversations:', err);
      this.conversations.set([]);
    }
  });
}

openConversation(conversationId: number): void {
  this.activeConversationId.set(conversationId);
  this.http.get<ServiceResult<MessageApi[]>>(`${BASE}/api/Conversation/${conversationId}/messages`).subscribe({
    next: (res) => this.activeMessages.set(res.data),
    error: (err) => console.error('Error fetching messages:', err)
  });
  this.http.put<ServiceResult<null>>(`${BASE}/api/Conversation/${conversationId}/read`, {}).subscribe();
}

sendMessage(): void {
  const conversationId = this.activeConversationId();
  const content = this.newMessageText().trim();
  if (!conversationId || !content) return;

  this.http.post<ServiceResult<null>>(`${BASE}/api/Conversation/${conversationId}/messages`, { content }).subscribe({
    next: () => {
      this.newMessageText.set('');
      this.openConversation(conversationId); // إعادة تحميل الرسائل بعد الإرسال
    },
    error: (err) => console.error('Error sending message:', err)
  });
}


markConversationRead(conversationId: number) {
  return this.http.put<ServiceResult<null>>(`${BASE}/api/Conversation/${conversationId}/read`, {});
}

  // ============================================================
  // ) ⚠️ وهمية مؤقتًا — لا يوجد Backend حقيقي لها بعد
  // ============================================================

  // 1) حساب متوسط التقييمات حقيقي 100% من الـ API
  averageRatingComputed = computed(() => {
    const list = this.reviews();
    if (!list || list.length === 0) return 0;
    const sum = list.reduce((acc, rev) => acc + rev.rating, 0);
    return Math.round((sum / list.length) * 10) / 10; // تقريب لأقرب رقم عشري واحد
  });

  // 2) حساب إجمالي المرضى الفريدين حقيقي 100% من الحجوزات
  totalPatientsComputed = computed(() => {
    const list = this.appointments();
    if (!list || list.length === 0) return 0;
    // Set بتضمن عدم تكرار نفس المريض لو حاجز أكتر من مرة
    const uniquePatients = new Set(list.map(app => app.patientId));
    return uniquePatients.size;
  });

  // 3) إجمالي الحجوزات حقيقي 100%
  totalAppointmentsComputed = computed(() => {
    return this.appointments()?.length || 0;
  });

  // 4) إجمالي الاستشارات حقيقي 100% من المحادثات
  totalConsultationsComputed = computed(() => {
    return this.conversations()?.length || 0;
  });

  // 5) تحديث السجنال القديم تلقائياً لكي يقرأ القيم الحقيقية المحسوبة دون تعديل الـ HTML
  analyticsDataComputed = computed(() => {
    return {
      averageRating: this.averageRatingComputed(),
      totalPatients: this.totalPatientsComputed(),
      totalAppointments: this.totalAppointmentsComputed(),
      totalConsultations: this.totalConsultationsComputed(),
      attendanceRate: 100, // نسبة افتراضية مؤقتاً
      cancellationRate: 0, // نسبة افتراضية مؤقتاً
      monthlyEarnings: [
        { month: 'مايو', amount: this.wallet()?.balance || 0 }, // ربط ديناميكي مع المحفظة الحقيقية
        { month: 'يونيو', amount: 0 },
        { month: 'يوليو', amount: 0 }
      ],
      patientGrowth: [
        { month: 'يناير', count: this.totalPatientsComputed() }
      ],
      mostActiveDay: 'الأحد',
      mostActiveTime: '10:00 ص',
      attendanceChangeRate: '0%'
    };
  });

  // ============================================================

  settingsData = signal<DoctorSettings>({
    emailNotifications: true,
    smsNotifications: false,
    websiteNotifications: true,
    appointmentReminder: true,
    showPhoneNumber: false,
    lockConsultations: false
  });

  updateSettings(updated: DoctorSettings): void {
    this.settingsData.set(updated);
  }


  // ضيفيهم جوه AppointmentService

todayAppointmentsCount = computed(() => {
  const today = new Date().toDateString();
  return this.appointments().filter(a => new Date(a.slotStart).toDateString() === today).length;
});

totalReviewsCount = computed(() => this.reviews().length);

totalEarnings = computed(() =>
  this.walletTransactions().filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0)
);
}