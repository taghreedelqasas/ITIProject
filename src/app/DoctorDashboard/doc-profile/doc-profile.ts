import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment';
import { Gender } from '../services/dashboard';

@Component({
  selector: 'app-doc-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-profile.html',
  styleUrl: './doc-profile.css'
})
export class DocProfile implements OnInit {
  protected appointmentService = inject(AppointmentService);

  firstName = '';
  lastName = '';

  ngOnInit(): void {
    // 1. جلب بيانات الحساب الشخصي أولاً
    this.appointmentService.getUserProfile().subscribe({
      next: (res) => {
        this.appointmentService.userProfile.set(res);
 
        // تفكيك الاسم المرجع من الـ API إلى خانتين
        if (res && res.fullName) {
          const nameParts = res.fullName.split(' ');
          this.firstName = nameParts[0] || '';
          this.lastName = nameParts.slice(1).join(' ') || '';
          console.log(this.firstName);

          
        }
        // 2. هنا السحر: نستخدم الـ id الخاص بالمستخدم لجلب بيانات الطبيب فوراً 
        // (تأكد أن الـ userRes.id هو نفسه الـ id المطلوب للـ Doctor في الـ API عندك)
    
           this.appointmentService.getDoctorById(2);
       
      },
      error: (err) => {
        console.error('فشل في تحميل بيانات ملف المستخدم:', err);
      }
    });

    // 3. جلب المعاملات المالية بشكل منفصل تماماً
    this.appointmentService.getWalletTransactions();
  }

  onUpdateProfile(): void {
    const user = this.appointmentService.userProfile();
    const doc = this.appointmentService.doctor();

    if (user && doc) {
      const fullUpdatedName = `${this.firstName} ${this.lastName}`.trim();
const body = {
  firstName: this.firstName,
  lastName: this.lastName,
  phoneNumber: user.phoneNumber,
  birthDate: user.birthDate,
  gender: user.gender
};

console.log(body)
      this.appointmentService.updateUserProfile({
        firstName: this.firstName,
        phoneNumber: user.phoneNumber ?? undefined,
        birthDate: user.birthDate ?? undefined,
       gender: user.gender ?? undefined
      }).subscribe({
        next: () => {
          this.appointmentService.updateDoctorProfile({
            // هحتاج بعدين اعدل ال id هنا يبقي dynamic
            id: 2,     
            licenseNumber: doc.licenseNumber,
            consultationFee: doc.consultationFee,
            address: doc.address

          }).subscribe({
            next: () => {
              // تحديث الـ Signal محلياً ليعكس الاسم فوراً في الواجهة
              this.appointmentService.userProfile.update(p => p ? { ...p, fullName: fullUpdatedName } : null);
              alert('تم تحديث البيانات المهنية والشخصية بنجاح! ✨');
            },
            error: (err) => console.error('خطأ أثناء تحديث بيانات الطبيب:', err)
          });
        },
        error: (err) => console.error('خطأ أثناء تحديث الحساب الشخصي:', err)
      });
    }
  }

  onUpdateWorkingHours(): void {
    alert('سيتم ربط تعديل أوقات العمل لاحقاً فور توفرها بالـ Backend.');
  }
  onGenderChange(value: any, user: any): void {
  // دفاع ضد أي قيمة نصية توصل بسبب الـ SSR hydration timing
  const numericValue = typeof value === 'number' ? value : Number(value);
  user.gender = Number.isNaN(numericValue) ? null : numericValue;
}
}