import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { DoctorAvailabilityService } from '../services/doctor-availability.service';
import {
  DoctorAvailability,
  CreateDoctorAvailabilityDto,
  UpdateDoctorAvailabilityDto
} from '../../core/models/availability.model';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../services/appointment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doctor-availability',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './doctor-avaliabilty.html',
  styleUrls: ['./doctor-avaliabilty.css']
})
export class DoctorAvailabilityComponent implements OnInit {

  private authService = inject(AuthService);
  private dashboardService = inject(AppointmentService)

  errorMessage = signal('');
  private fb = inject(FormBuilder);

  service = inject(DoctorAvailabilityService);

  doctorId = this.authService.getDoctorId()!;

  showModal = signal(false);

  editMode = signal(false);

  selectedId = signal<number>(0);

  saving = signal(false);

  // daysOfWeek = [
  //   'الأحد',
  //   'الإثنين',
  //   'الثلاثاء',
  //   'الأربعاء',
  //   'الخميس',
  //   'الجمعة',
  //   'السبت'
  // ];

  form = this.fb.group({

    startTime: ['', Validators.required],

    endTime: ['', Validators.required]

  });

  slots = computed(() => this.service.slots());

  ngOnInit(): void {

    this.loadSlots();
    this.dashboardService.getDoctorAppointments();

  }
// أضيفي دول جوه الكومبوننت من غير ما تلمسي حاجة تانية

activeStatusFilter = signal<'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | null>(null);

setStatusFilter(status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | null) {
  this.activeStatusFilter.set(status);
}

filteredAppointments = computed(() => {
  const filter = this.activeStatusFilter();
  const all = this.todayAndFutureAppointments(); // تم التغيير هنا لتأخذ المواعيد الحالية والمستقبلية
  return filter ? all.filter(app => app.status === filter) : all;
});



  loadSlots() {

    this.service.getDoctorSlots(this.doctorId);

  }

  openCreate() {

    this.editMode.set(false);

    this.selectedId.set(0);

    this.form.reset();

    this.showModal.set(true);

  }

  closeModal() {

    this.showModal.set(false);

    this.form.reset();
this.errorMessage.set('');
  }

  edit(slot: DoctorAvailability) {

    this.editMode.set(true);

    this.selectedId.set(slot.id);

    this.form.patchValue({

      startTime: slot.startTime.substring(0,16),

      endTime: slot.endTime.substring(0,16)

    });

    this.showModal.set(true);

  }

  save() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const startVal = new Date(this.form.value.startTime!);
  const endVal = new Date(this.form.value.endTime!);
  const now = new Date();

  // 1. التحقق من أن تاريخ البداية ليس في الماضي
  if (startVal < now) {
    this.errorMessage.set('لا يمكن اختيار وقت بداية في الماضي!');
    return;
  }

  // 2. التحقق من أن تاريخ النهاية بعد تاريخ البداية
  if (endVal <= startVal) {
    this.errorMessage.set('وقت النهاية يجب أن يكون بعد وقت البداية!');
    return;
  }

  this.saving.set(true);
  this.errorMessage.set(''); // تصفير رسالة الخطأ إذا كان كل شيء سليم

  if (this.editMode()) {
    const dto: UpdateDoctorAvailabilityDto = {
      id: this.selectedId(),
      startTime: this.form.value.startTime!,
      endTime: this.form.value.endTime!
    };

    this.service.update(dto).subscribe({
      next: () => {
        this.closeModal();
        this.loadSlots();
        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح',
          text: 'تمت تعديل الموعد',
          timer: 1800,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'حدث خطأ',
          text: err.error?.message ?? 'حدث خطأ',
          confirmButtonColor: '#4A148C'
        });
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      }
    });
  } else {
    const dto: CreateDoctorAvailabilityDto = {
      doctorId: this.doctorId,
      startTime: this.form.value.startTime!,
      endTime: this.form.value.endTime!
    };

    this.service.create(dto).subscribe({
      next: () => {
        this.closeModal();
        this.loadSlots();
        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح',
          text: 'تمت إضافة الموعد',
          timer: 1800,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'حدث خطأ',
          text: err.error?.message ?? 'حدث خطأ',
          confirmButtonColor: '#4A148C'
        });
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      }
    });
  }
}
    async delete(slot: DoctorAvailability) {

  const result = await Swal.fire({
  title: 'حذف الموعد؟',
  text: 'لن تتمكن من استرجاعه بعد الحذف',

  showCancelButton: true,
  confirmButtonText: 'نعم، احذف',
  cancelButtonText: 'إلغاء',
  confirmButtonColor: '#4A148C',
  cancelButtonColor: '#9CA3AF'
});

if (!result.isConfirmed) return;

    this.service.delete(slot.id).subscribe({

      next: () => {

        this.loadSlots();

      },

      error: (err) => {

        Swal.fire({
          icon: 'error',
          title: 'حدث خطأ',
          text: err.error?.message ?? 'تعذر حذف الموعد',
          confirmButtonColor: '#4A148C'
        });

      }

    });

  }

  getSlotsByDay(day: string): DoctorAvailability[] {

    return this.slots().filter(slot => {

      const date = new Date(slot.startTime);

      const arabicDay = date.toLocaleDateString('ar-EG', {
        weekday: 'long'
      });

      return arabicDay === day;

    });

  }

  formatTime(date: string): string {

    return new Date(date).toLocaleTimeString('ar-EG', {

      hour: '2-digit',

      minute: '2-digit',

      hour12: true

    });

  }

  formatDate(date: string): string {

    return new Date(date).toLocaleDateString('ar-EG');

  }

  trackBySlot(index: number, slot: DoctorAvailability) {

    return slot.id;

  }

groupedSlots() {
  const groups: { date: string; slots: DoctorAvailability[] }[] = [];
  const now = new Date(); // اللحظة الحالية تماماً

  // 1. فلترة الـ slots واستبعاد أي slot وقته انتهى خلاص
  const activeSlots = this.slots().filter(slot => {
    const slotEndTime = new Date(slot.endTime);
    return slotEndTime >= now; // الاحتفاظ فقط بالمواعيد المستقبلية أو اللي شغالة دلوقتي
  });

  // 2. تجميع المواعيد النشطة فقط حسب اليوم
  activeSlots.forEach(slot => {
    const date = slot.startTime.split('T')[0];
    let group = groups.find(g => g.date === date);

    if (!group) {
      group = {
        date,
        slots: []
      };
      groups.push(group);
    }

    group.slots.push(slot);
  });

  return groups;
}
formatDateHeader(date: string) {

  return new Date(date).toLocaleDateString('ar-EG', {

    weekday: 'long',

    year: 'numeric',

    month: 'long',

    day: 'numeric'

  });

}


 todayAndFutureAppointments() {
  const now = new Date();
  
  // ضبط الوقت على بداية اليوم الحالي (الساعة 12 بالليل) عشان نضمن ظهور مواعيد اليوم بالكامل والمستقبل
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return this.dashboardService.appointments().filter(a => {
    const appDate = new Date(a.slotStart);
    return appDate >= startOfToday; // يعرض مواعيد اليوم والمواعيد القادمة، ويستبعد أي يوم قديم
  });
}

  async markAsCompleted(app: any) {

  if (app.status === 'Completed') return;

  // الباك إند بيرفض إتمام موعد لسه Pending، لازم يتأكد الأول
  if (app.status === 'Pending') {

    const confirmResult = await Swal.fire({
      title: 'تأكيد الموعد؟',
      text: 'الموعد لسه بانتظار الحضور، هل تريد تأكيده أولاً؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، أكد الموعد',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#4A148C',
      cancelButtonColor: '#9CA3AF'
    });

    if (!confirmResult.isConfirmed) return;

    this.dashboardService.confirmAppointment(app.id).subscribe({
      next: () => {
        app.status = 'Confirmed';

        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح',
          text: 'تم تأكيد الموعد، اضغطي تسجيل الحضور مرة أخرى لإتمامه',
          timer: 2200,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'حدث خطأ',
          text: err.error?.message ?? 'تعذر تأكيد الموعد',
          confirmButtonColor: '#4A148C'
        });
      }
    });

    return;
  }

  const result = await Swal.fire({
    title: 'تسجيل الحضور؟',
    text: 'هل تريد تسجيل حضور المريض لهذا الموعد؟',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'نعم، سجل الحضور',
    cancelButtonText: 'إلغاء',
    confirmButtonColor: '#4A148C',
    cancelButtonColor: '#9CA3AF'
  });

  if (!result.isConfirmed) return;

  this.dashboardService.completeAppointment(app.id).subscribe({
    next: () => {
      app.status = 'Completed';

      Swal.fire({
        icon: 'success',
        title: 'تم بنجاح',
        text: 'تم تسجيل حضور المريض',
        timer: 1800,
        showConfirmButton: false
      });
    },
    error: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'حدث خطأ',
        text: err.error?.message ?? 'تعذر تسجيل الحضور',
        confirmButtonColor: '#4A148C'
      });
    }
  });
}


// للحصول على الوقت الحالي بالصيغة المطلوبة لـ datetime-local (YYYY-MM-DDTHH:mm)
get minDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

  formatShortTime(date: string): string {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}