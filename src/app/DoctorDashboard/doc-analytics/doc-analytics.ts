// src/app/DoctorDashboard/doc-analytics/doc-analytics.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../services/appointment';

@Component({
  selector: 'app-doc-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doc-analytics.html',
  styleUrl: './doc-analytics.css'
})
export class DocAnalytics implements OnInit {
  protected appointmentService = inject(AppointmentService);

  ngOnInit(): void {
    this.appointmentService.loadDashboardData();     // لشحن الـ appointments والـ المرضى
    this.appointmentService.getMyReviews();             // لشحن الـ reviews وحساب التقييم
    this.appointmentService.getDoctorConversations();       // لشحن الـ conversations وحساب الاستشارات
    this.appointmentService.getWallet();
    // analyticsData بيانات وهمية جاهزة من غير حاجة لاستدعاء API — مفيش داعي لأي استدعاء هنا
  }
}