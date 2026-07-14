// src/app/DoctorDashboard/doc-analytics/doc-analytics.ts
import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../services/appointment';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-doc-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doc-analytics.html',
  styleUrl: './doc-analytics.css'
})
export class DocAnalytics implements OnInit {
  protected appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);

  doctorId = this.authService.getDoctorId()!;

  // إحداثيات خط رسم "نمو العرض" — مبنية على appointmentService.bookingsGrowthComputed() الحقيقي
  growthChartPoints = computed(() => {
    const data = this.appointmentService.patientGrowthComputed();
    const max = Math.max(1, ...data.map(d => d.count));
    const width = 300;
    const height = 100;
    const step = data.length > 1 ? width / (data.length - 1) : width;

    return data
      .map((d, i) => {
        const x = i * step;
        const y = height - (d.count / max) * height;
        return `${x},${y}`;
      })
      .join(' ');
  });

  ngOnInit(): void {
    this.appointmentService.loadDashboardData();     // لشحن الـ appointments والـ المرضى
    this.appointmentService.getMyReviews();             // لشحن الـ reviews وحساب التقييم
    this.appointmentService.getDoctorConversations();       // لشحن الـ conversations وحساب الاستشارات
    this.appointmentService.getWallet();
    this.appointmentService.getDoctorById(this.doctorId); // لشحن بيانات الدكتور (سعر الكشف consultationFee)
    // analyticsData بيانات وهمية جاهزة من غير حاجة لاستدعاء API — مفيش داعي لأي استدعاء هنا
  }

  
}