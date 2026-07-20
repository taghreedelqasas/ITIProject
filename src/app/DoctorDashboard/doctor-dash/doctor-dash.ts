import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AppointmentService } from '../services/appointment';
import { AuthService } from '../../core/services/auth.service'; // ظبطي المسار حسب مكان الملف عندك
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
@Component({
  selector: 'app-doctor-dash',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './doctor-dash.html',
  styleUrl: './doctor-dash.css'
})
export class DoctorDash implements OnInit {
  protected dashService = inject(AppointmentService);
   constructor( public authService: AuthService) {}

private router = inject(Router);


isChatRoute(): boolean {
    return  this.router.url.includes('/chat'); 
    // ملحوظة: غيري الكلمات ('/chat' أو '/consultations') بناءً على اسم الـ route الحقيقي لشات الدكتور عندك
  }


onLogout(event: Event): void {
  event.preventDefault(); // يمنع الـ <a> من التنقل فورًا لـ "/"

Swal.fire({
  title: 'تسجيل الخروج',
  text: 'هل تريد بالتأكيد تسجيل الخروج من هذا الحساب؟',
  width: '560px', // زيادة العرض قليلاً ليطابق أبعاد الصورة
  showCancelButton: true,
  confirmButtonText: 'تسجيل الخروج',
  cancelButtonText: 'إلغاء',
  reverseButtons: true, // يضع إلغاء على اليسار وتسجيل الخروج على اليمين
  customClass: {
    popup: 'swal-custom-popup',
    title: 'swal-custom-title',
    htmlContainer: 'swal-custom-text',
    confirmButton: 'swal-custom-confirm',
    cancelButton: 'swal-custom-cancel',
    actions: 'swal-custom-actions'
  },
  // نقوم بإلغاء الألوان الافتراضية هنا للتحكم الكامل بها عبر CSS
  buttonsStyling: false 
}).then((result) => {
  if (result.isConfirmed) {
    this.authService.logout();
    this.finishLogout();
    this.router.navigate(['/']);
  }
});
}

private finishLogout(): void {
  localStorage.removeItem('token');

}

  ngOnInit(): void {
    // استخدمي userProfile (حقيقي 100%) بدل doctor() في الـ Header/الترحيب
    if (!this.dashService.userProfile()) {
      this.dashService.getUserProfile();
    }
  }
}