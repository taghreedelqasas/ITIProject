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
  private dashboardService = inject(AppointmentService);

  errorMessage = signal('');
  private fb = inject(FormBuilder);

  service = inject(DoctorAvailabilityService);

  doctorId = this.authService.getDoctorId()!;

  showModal = signal(false);
  editMode = signal(false);
  selectedId = signal<number>(0);
  saving = signal(false);

  form = this.fb.group({
    startTime: ['', Validators.required],
    endTime: ['', Validators.required]
  });

  slots = computed(() => this.service.slots());

  activeStatusFilter = signal<'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | null>(null);

  ngOnInit(): void {
    this.loadSlots();
    this.dashboardService.getDoctorAppointments();
  }

  setStatusFilter(status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | null) {
    this.activeStatusFilter.set(status);
  }

  filteredAppointments = computed(() => {
    const filter = this.activeStatusFilter();
    const all = this.dashboardService.appointments(); 
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

    if (filter === 'Confirmed') {
      return all.filter(app => {
        const appDate = new Date(app.slotStart).getTime();
        const status = String(app.status).toLowerCase();
        return appDate >= startOfToday &&
               (status === 'confirmed' || status === 'pending') &&
               !this.isPastAppointment(app.slotStart);
      }).sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
    }

    if (filter === 'Completed') {
      return all.filter(app => {
        const appDate = new Date(app.slotStart).getTime();
        return app.status === 'Completed' && appDate >= startOfToday && appDate <= endOfToday;
      }).sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
    }

    if (filter === 'Cancelled') {
      return all.filter(app => {
        const appDate = new Date(app.slotStart).getTime();
        return app.status === 'Cancelled' && appDate >= startOfToday;
      }).sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
    }

    return all.filter(app => {
      const appDate = new Date(app.slotStart).getTime();
      const isInvalidFutureCompleted = appDate > endOfToday && app.status === 'Completed';

      return appDate >= startOfToday && !isInvalidFutureCompleted;
    }).sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
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
      startTime: slot.startTime.substring(0, 16),
      endTime: slot.endTime.substring(0, 16)
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

    if (startVal < now) {
      this.errorMessage.set('لا يمكن اختيار وقت بداية في الماضي!');
      return;
    }

    if (endVal <= startVal) {
      this.errorMessage.set('وقت النهاية يجب أن يكون بعد وقت البداية!');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

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
            text: 'تم تعديل الموعد بنجاح',
            timer: 1800,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.showErrorAlert(err, 'تعذر تعديل الموعد');
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
            text: 'تمت إضافة الموعد بنجاح',
            timer: 1800,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.showErrorAlert(err, 'تعذر إضافة الموعد');
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
      icon: 'warning',
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
        Swal.fire({
          icon: 'success',
          title: 'تم الحذف',
          text: 'تم حذف الموعد بنجاح',
          timer: 1800,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.showErrorAlert(err, 'تعذر حذف الموعد المتاح');
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
    const now = new Date();

    const activeSlots = this.slots().filter(slot => {
      const slotEndTime = new Date(slot.endTime);
      return slotEndTime >= now;
    });

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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return this.dashboardService.appointments().filter(a => {
      const appDate = new Date(a.slotStart);
      return appDate >= startOfToday;
    });
  }

  async markAsCompleted(app: any) {
    if (app.status === 'Completed') return;

    const now = new Date();
    const appointmentTime = new Date(app.slotStart);

    if (appointmentTime > now) {
      Swal.fire({
        icon: 'info',
        title: 'عذراً، لا يمكن تسجيل الحضور!',
        text: 'لا يمكنك تسجيل حضور المريض قبل حلول موعد الحجز الفعلي.',
        confirmButtonColor: '#4A148C',
        confirmButtonText: 'حسناً'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'تسجيل حضور المريض؟',
      text: 'هل تريد تسجيل حضور المريض وتبديل حالة الموعد إلى (حضر)؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، سجل الحضور',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#4A148C',
      cancelButtonColor: '#9CA3AF'
    });

    if (!result.isConfirmed) return;

    if (app.status === 'Pending' || app.status === 'pending') {
      this.dashboardService.confirmAppointment(app.id).subscribe({
        next: () => {
          app.status = 'Confirmed';
          this.executeComplete(app);
        },
        error: (err) => {
          this.showErrorAlert(err, 'تعذر تأكيد الموعد تلقائياً');
        }
      });
    } else if (app.status === 'Confirmed' || app.status === 'confirmed') {
      this.executeComplete(app);
    }
  }

  private executeComplete(app: any) {
    this.dashboardService.completeAppointment(app.id).subscribe({
      next: () => {
        app.status = 'Completed';
        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح',
          text: 'تم تسجيل حضور المريض بنجاح',
          timer: 1800,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.showErrorAlert(err, 'تعذر تسجيل الحضور');
      }
    });
  }

  // دالة موحدة ومعالجة لجميع رسائل الخطأ وترجمتها للعربية
  private showErrorAlert(err: any, defaultMsg: string) {
    const serverMessage = err.error?.message || err.message || '';
    let arabicMessage = defaultMsg;

    // ترجمة الأخطاء الشائعة القادمة من الـ Backend
    if (serverMessage.includes('Cannot delete a booked slot') || serverMessage.includes('booked slot')) {
      arabicMessage = 'لا يمكن حذف هذا الموعد لأنه محجوز بالفعل من قبل مريض.';
    } else if (serverMessage.includes('Slot not found')) {
      arabicMessage = 'الموعد غير موجود أو تم حذفه سابقاً.';
    } else if (serverMessage.includes('already booked')) {
      arabicMessage = 'هذا الموعد محجوز بالكامل.';
    } else if (serverMessage) {
      arabicMessage = serverMessage;
    }

    Swal.fire({
      icon: 'error',
      title: 'حدث خطأ',
      text: arabicMessage,
      confirmButtonText: 'موافق',
      confirmButtonColor: '#4A148C'
    });
  }

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

  isPastAppointment(slotStart: string | Date): boolean {
    const appointmentTime = new Date(slotStart).getTime();
    const now = new Date().getTime();
    const bufferTime = 2 * 60 * 60 * 1000; 
    return now > (appointmentTime + bufferTime);
  }
}