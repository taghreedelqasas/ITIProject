import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment';
import { AuthService } from '../../core/services/auth.service'; // ظبطي المسار حسب مكان الملف عندك
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
@Component({
  selector: 'app-doc-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-settings.html',
  styleUrl: './doc-settings.css'
})
export class DocSettings implements OnInit {

  constructor( public authService: AuthService) {}
  protected appointmentService = inject(AppointmentService);
private router = inject(Router);
  ngOnInit(): void {
    // لا يتم استدعاء getSettings لأن الـ Signal يمتلك الـ Default state مباشرة من الـ Service
  }

  onToggleChange(): void {
    const currentSettings = this.appointmentService.settingsData();
    // الدالة تعيد void وتحدث الـ Signal داخلياً، لذا نستدعيها مباشرة بدون subscribe
    this.appointmentService.updateSettings(currentSettings);
    console.log('Settings updated locally in Signal!');
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

  onDeleteAccount(): void {
    const confirmDelete = confirm('هل أنتِ متأكدة تماماً من حذف الحساب؟ هذا الإجراء لا يمكن التراجع عنه!');
    if (confirmDelete) {
      alert('تم إرسال طلب حذف الحساب للإدارة.');
    }
  }
}