// src/app/features/admin/support/support.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

// ---------------------------------------------------------------------------
// ملحوظة: مفيش endpoint support/complaints في الباك حاليًا
// (مفيش SupportController ولا IAdminSupportService). الصفحة دي placeholder
// بس عشان الرابط في السايدبار "الدعم والشكاوي" يبقى شغال ومايديش 404،
// ولازم يتستبدل بالتصميم والبيانات الحقيقية أول ما الباك يوفر الـ endpoints دي.
// ---------------------------------------------------------------------------
@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div dir="rtl" class="space-y-8">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800">الدعم والشكاوي</h1>
        <p class="text-sm text-slate-400 mt-1">إدارة استفسارات وشكاوى المستخدمين</p>
      </div>

      <div class="rounded-2xl bg-white border border-slate-100 p-12 flex flex-col items-center text-center gap-3">
        <div class="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 12a8 8 0 1116 0v5a2.5 2.5 0 01-2.5 2.5H15" stroke-linecap="round" stroke-linejoin="round" />
            <rect x="2.5" y="12" width="4" height="5" rx="1" />
            <rect x="17.5" y="12" width="4" height="5" rx="1" />
          </svg>
        </div>
        <h2 class="font-bold text-slate-800 text-lg">هذه الصفحة قيد الإنشاء</h2>
        <p class="text-sm text-slate-400 max-w-md">
          هنعرض هنا تذاكر الدعم والشكاوي أول ما يتوفر الـ endpoint المناسب في الباك.
        </p>
      </div>
    </div>
  `,
})
export class SupportComponent {}
