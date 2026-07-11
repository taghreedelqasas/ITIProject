import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment.model';

@Component({
  selector: 'app-cancel-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './cancel-modal-component.html',
  styleUrl: './cancel-modal-component.css',
})
export class CancelModalComponent {
  @Input({ required: true }) appointment!: Appointment;
  @Output() closed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<number>();

  private appointmentService = inject(AppointmentService);

  submitting = signal(false);
  errorMsg = signal<string | null>(null);

  confirmCancel(): void {
    if (!this.appointment.id) return;

    this.submitting.set(true);
    this.errorMsg.set(null);

    this.appointmentService.cancel(this.appointment.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.cancelled.emit(this.appointment.id);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err?.error?.message || 'تعذر إلغاء الموعد، حاول مرة أخرى.');
      },
    });
  }

  dismiss(): void {
    if (this.submitting()) return;
    this.closed.emit();
  }
}