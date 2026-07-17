// src/app/features/admin/admin-layout/admin-layout.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: 'home' | 'patients' | 'doctors' | 'appointments' | 'payments' | 'withdrawals' | 'support' | 'analytics' | 'settings';
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  constructor(private readonly authService: AuthService) {}

  // TODO: اربطيها بالـ Auth service الحقيقي بتاعك بدل الـ hardcoded دي
  currentUser = {
    name: 'بسملة علي',
    role: 'مدير المنصة',
    avatarUrl: '/images/admin-profile.png',
  };

  navItems: NavItem[] = [
    { label: 'الرئيسية', route: '/admin', icon: 'home' },
    { label: 'إدارة المرضى', route: '/admin/patients', icon: 'patients' },
    { label: 'إدارة الأطباء', route: '/admin/doctors', icon: 'doctors' },
    { label: 'إدارة المواعيد', route: '/admin/appointments', icon: 'appointments' },
    { label: 'المدفوعات و العمولات', route: '/admin/payments', icon: 'payments' },
    { label: 'الإعدادات', route: '/admin/settings', icon: 'settings' },
  ];

  // ---------------- صورة البروفايل ----------------
  // ملحوظة: دي معاينة محلية بس (بتتخزن في المتصفح كـ base64) لحد ما يتضاف
  // endpoint لرفع صورة البروفايل بتاعة الأدمن في الباك.
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.currentUser = { ...this.currentUser, avatarUrl: reader.result as string };
    };
    reader.readAsDataURL(file);

    // نصفّر قيمة الـ input عشان لو المستخدم يختار نفس الصورة تاني يشتغل الـ change event
    input.value = '';
  }

  // ---------------- تأكيد تسجيل الخروج ----------------
  // ملحوظة: AuthService.logout() في مشروعكم synchronous (بيرجع void)
  // مش Observable - بيمسح التوكن ويعمل navigate بنفسه. مفيش داعي لـ .pipe()/.subscribe() هنا.

  isLogoutConfirmOpen = false;

  openLogoutConfirm(): void {
    this.isLogoutConfirmOpen = true;
  }

  closeLogoutConfirm(): void {
    this.isLogoutConfirmOpen = false;
  }

  confirmLogout(): void {
    this.isLogoutConfirmOpen = false;
    this.authService.logout();
  }
}
