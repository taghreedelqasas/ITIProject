import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment';

@Component({
  selector: 'app-doc-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-settings.html',
  styleUrl: './doc-settings.css'
})
export class DocSettings implements OnInit {
  protected appointmentService = inject(AppointmentService);

  ngOnInit(): void {
    // لا يتم استدعاء getSettings لأن الـ Signal يمتلك الـ Default state مباشرة من الـ Service
  }

  onToggleChange(): void {
    const currentSettings = this.appointmentService.settingsData();
    // الدالة تعيد void وتحدث الـ Signal داخلياً، لذا نستدعيها مباشرة بدون subscribe
    this.appointmentService.updateSettings(currentSettings);
    console.log('Settings updated locally in Signal!');
  }

  onLogout(): void {
    alert('تم تسجيل الخروج بنجاح! 👋');
  }

  onDeleteAccount(): void {
    const confirmDelete = confirm('هل أنتِ متأكدة تماماً من حذف الحساب؟ هذا الإجراء لا يمكن التراجع عنه!');
    if (confirmDelete) {
      alert('تم إرسال طلب حذف الحساب للإدارة.');
    }
  }
}