import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment.model';
import { RescheduleModalComponent } from '../reschedule-modal-component/reschedule-modal-component';
import { CancelModalComponent } from '../cancel-modal-component/cancel-modal-component';


@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RescheduleModalComponent,CancelModalComponent],
  templateUrl: './appointments-list-component.html',
  styleUrl: './appointments-list-component.css',
})
export class AppointmentsListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  appointments = signal<Appointment[]>([]);
  loading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  appointmentToReschedule = signal<Appointment | null>(null);
  appointmentToCancel = signal<Appointment | null>(null);

  expandedUpcoming = signal(true);
  expandedPast = signal(true);

  upcoming = computed(() =>
    this.appointments().filter((a) => this.canModify(a))
  );

  past = computed(() =>
    this.appointments().filter((a) => !this.canModify(a))
  );

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.appointmentService.getMyAppointments().subscribe({
      next: (data) => {
        this.appointments.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('حصل خطأ أثناء تحميل المواعيد، حاول تاني.');
        this.loading.set(false);
      },
    });
  }

  toggleUpcoming(): void {
    this.expandedUpcoming.update((v) => !v);
  }

  togglePast(): void {
    this.expandedPast.update((v) => !v);
  }

  statusLabel(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return 'قيد الانتظار';
      case 'confirmed':
        return 'مؤكد';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status || '—';
    }
  }

  statusClass(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return 'status--pending';
      case 'confirmed':
        return 'status--confirmed';
      case 'completed':
        return 'status--completed';
      case 'cancelled':
        return 'status--cancelled';
      default:
        return '';
    }
  }

  // إعادة الجدولة والإلغاء متاحين بس للمواعيد اللي لسه شغالة
  canModify(appt: Appointment): boolean {
    const s = (appt.status || '').toLowerCase();
    return s === 'pending' || s === 'confirmed';
  }

  // بنبني النص كـ string جاهز عشان نلفه بـ dir="ltr" في التمبلت
  // ونمنع الـ bidi reordering اللي بيحصل للتاريخ/الوقت جوه صفحة RTL
  formatDate(iso?: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatTimeRange(startIso?: string, endIso?: string): string {
    if (!startIso) return '';
    const fmt = (iso: string) =>
      new Date(iso).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    return endIso ? `${fmt(startIso)} - ${fmt(endIso)}` : fmt(startIso);
  }

  openReschedule(appt: Appointment): void {
    this.appointmentToReschedule.set(appt);
  }

  closeReschedule(): void {
    this.appointmentToReschedule.set(null);
  }

  onRescheduled(updated: Appointment): void {
    const id = this.appointmentToReschedule()?.id;
    this.appointments.update((list) =>
      list.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
    this.closeReschedule();
  }

  openCancel(appt: Appointment): void {
    this.appointmentToCancel.set(appt);
  }

  closeCancel(): void {
    this.appointmentToCancel.set(null);
  }

  onCancelled(id: number): void {
    this.appointments.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
    );
    this.closeCancel();
  }
}