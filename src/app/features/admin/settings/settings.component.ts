// src/app/features/admin/settings/settings.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// ---------------------------------------------------------------------------
// ملحوظة مهمة: الصفحة دي UI بس حاليًا - مفيش أي endpoint في الباك لإعدادات
// الأدمن (لا profile update ولا platform settings ولا notification prefs).
// كل الحقول بتشتغل على state محلي في الفرونت فقط (زرار "حفظ" بيعرض رسالة
// نجاح شكلية ومش بيبعت أي request). لازم تتربط بالباك أول ما الـ endpoints
// دي تتوفر.
// ---------------------------------------------------------------------------

type SettingsTab = 'profile' | 'notifications' | 'security' | 'platform';

interface TabConfig {
  key: SettingsTab;
  label: string;
  icon: 'profile' | 'bell' | 'lock' | 'sliders';
}

const TABS: TabConfig[] = [
  { key: 'profile', label: 'الملف الشخصي', icon: 'profile' },
  { key: 'notifications', label: 'الإشعارات', icon: 'bell' },
  { key: 'security', label: 'الأمان', icon: 'lock' },
  { key: 'platform', label: 'إعدادات المنصة', icon: 'sliders' },
];

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  tabs = TABS;
  activeTab: SettingsTab = 'profile';

  // ---------------- الملف الشخصي (Mock - مفيش endpoint) ----------------
  profileForm = {
    name: 'بسملة علي',
    email: 'basmala.ali@maw3ed.com',
    phone: '01000000000',
    role: 'مدير المنصة',
  };
  profileSaved = false;

  // ---------------- الإشعارات (Mock - مفيش endpoint) ----------------
  notificationPrefs = {
    newDoctorSignup: true,
    newPatientSignup: true,
    newAppointment: true,
    cancelledAppointment: true,
    withdrawalRequests: true,
    weeklySummaryEmail: false,
  };
  notificationsSaved = false;

  // ---------------- الأمان (Mock - مفيش endpoint) ----------------
  securityForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  securityError = '';
  securitySaved = false;
  twoFactorEnabled = false;

  // ---------------- إعدادات المنصة العامة (Mock - مفيش endpoint) ----------------
  platformForm = {
    platformName: 'Maw3ed - موعد',
    supportEmail: 'support@maw3ed.com',
    defaultCommissionRate: 10,
    maintenanceMode: false,
    allowNewDoctorSignups: true,
  };
  platformSaved = false;

  setTab(tab: SettingsTab): void {
    this.activeTab = tab;
  }

  // كل "حفظ" هنا شكلي بس - بيعرض رسالة نجاح لمدة 3 ثواني من غير أي نداء API فعلي
  saveProfile(): void {
    this.profileSaved = true;
    setTimeout(() => (this.profileSaved = false), 3000);
  }

  saveNotifications(): void {
    this.notificationsSaved = true;
    setTimeout(() => (this.notificationsSaved = false), 3000);
  }

  saveSecurity(): void {
    this.securityError = '';

    if (!this.securityForm.currentPassword || !this.securityForm.newPassword) {
      this.securityError = 'من فضلك املأ كلمة المرور الحالية والجديدة.';
      return;
    }
    if (this.securityForm.newPassword.length < 8) {
      this.securityError = 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.';
      return;
    }
    if (this.securityForm.newPassword !== this.securityForm.confirmPassword) {
      this.securityError = 'كلمة المرور الجديدة وتأكيدها غير متطابقين.';
      return;
    }

    this.securitySaved = true;
    this.securityForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    setTimeout(() => (this.securitySaved = false), 3000);
  }

  savePlatform(): void {
    this.platformSaved = true;
    setTimeout(() => (this.platformSaved = false), 3000);
  }
}
