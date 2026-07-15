import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doc-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-profile.html',
  styleUrl: './doc-profile.css'
})
export class DocProfile implements OnInit {
  protected appointmentService = inject(AppointmentService);
  doctorId!: number;
  firstName = '';
  lastName = '';
  
  constructor(private authService: AuthService) {
    const id = this.authService.getDoctorId();
    if (id === null) {
      console.error('DoctorId غير موجود — تأكد إن المستخدم مسجل دخول كـ Doctor');
    }
    this.doctorId = id ?? 0;
  }

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
    
          //  const doctorId = (res as any).doctorId ?? (res as any).id;
          //  if (doctorId) {
          //    this.appointmentService.getDoctorById(doctorId);
          //  }
       
           this.appointmentService.getDoctorById(this.doctorId) 
      },
      error: (err) => {
        console.error('فشل في تحميل بيانات ملف المستخدم:', err);
      }
    });

    // 3. جلب المعاملات المالية بشكل منفصل تماماً
    this.appointmentService.getWalletTransactions();
  }
private mapGenderToEnum(label: string | number | null | undefined): number | undefined {
  if (label === 'ذكر' || label === 'Male' || label === 1) return 1;
  if (label === 'أنثى' || label === 'Female' || label === 2) return 2;
  return undefined;
}


onUpdateProfile(): void {
  const user = this.appointmentService.userProfile();
  const doc = this.appointmentService.doctor();

  if (user && doc) {
    const fullUpdatedName = `${this.firstName} ${this.lastName}`.trim();

    this.appointmentService.updateUserProfile({
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: user.phoneNumber ?? undefined,
      birthDate: user.birthDate ?? undefined,
      gender: this.mapGenderToEnum(user.gender)
    }).subscribe({
      next: () => {
        this.appointmentService.updateDoctorProfile({
          id: doc.id,
          licenseNumber: doc.licenseNumber,
          consultationFee: doc.consultationFee,
          address: doc.address
        }).subscribe({
          next: () => {
            // تحديث الاسم في الـ Signal
            this.appointmentService.userProfile.update(p =>
              p ? { ...p, fullName: fullUpdatedName } : null
            );

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'تم تحديث البيانات المهنية والشخصية بنجاح! ',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
          },
          error: (err) => {
            console.error('خطأ أثناء تحديث بيانات الطبيب:', err);

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'حدث خطأ أثناء تحديث بيانات الطبيب',
              showConfirmButton: false,
              timer: 3000,
            });
          }
        });
      },
      error: (err) => {
        console.error('خطأ أثناء تحديث الحساب الشخصي:', err);

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'حدث خطأ أثناء تحديث الحساب الشخصي',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    });
  }
}

  onUpdateWorkingHours(): void {
    alert('سيتم ربط تعديل أوقات العمل لاحقاً فور توفرها بالـ Backend.');
  }

  getGenderLabel(gender: any): string {
  if (gender === 'Male' || gender === 1) return 'ذكر';
  if (gender === 'Female' || gender === 2) return 'أنثى';
  return '—';
}
}