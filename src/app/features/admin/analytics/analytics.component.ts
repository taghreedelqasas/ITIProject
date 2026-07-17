// src/app/features/admin/analytics/analytics.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

// ---------------------------------------------------------------------------
// ملحوظة: مفيش endpoint analytics/ratings تفصيلي في الباك حاليًا (اللي موجود
// بس هو AdminDashboardService المستخدم في نظرة عامة). الصفحة دي placeholder
// بس عشان الرابط في السايدبار "التحليلات والتقييمات" يبقى شغال ومايديش 404،
// ولازم يتستبدل بالتصميم والبيانات الحقيقية أول ما الباك يوفر الـ endpoints دي.
// ---------------------------------------------------------------------------
@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div dir="rtl" class="space-y-8">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800">التحليلات والتقييمات</h1>
        <p class="text-sm text-slate-400 mt-1">تحليلات متقدمة وتقييمات الأطباء والمنصة</p>
      </div>

      <div class="rounded-2xl bg-white border border-slate-100 p-12 flex flex-col items-center text-center gap-3">
        <div class="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 21V9M9 21V3M15 21v-7M21 21V6" stroke-linecap="round" />
          </svg>
        </div>
        <h2 class="font-bold text-slate-800 text-lg">هذه الصفحة قيد الإنشاء</h2>
        <p class="text-sm text-slate-400 max-w-md">
          هنعرض هنا تحليلات وتقييمات تفصيلية أول ما يتوفر الـ endpoint المناسب في الباك.
        </p>
      </div>
    </div>
  `,
})
export class AnalyticsComponent {}
