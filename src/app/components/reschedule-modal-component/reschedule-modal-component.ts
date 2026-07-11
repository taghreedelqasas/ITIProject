import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment, AvailableSlot } from '../../core/models/appointment.model';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  inCurrentMonth: boolean;
  hasSlots: boolean;
  isToday: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-reschedule-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reschedule-modal-component.html',
  styleUrl: './reschedule-modal-component.css',
})
export class RescheduleModalComponent implements OnInit {
  @Input({ required: true }) appointment!: Appointment;
  @Output() closed = new EventEmitter<void>();
  @Output() rescheduled = new EventEmitter<Appointment>();

  private appointmentService = inject(AppointmentService);

  loadingSlots = signal(true);
  submitting = signal(false);
  errorMsg = signal<string | null>(null);

  allSlots = signal<AvailableSlot[]>([]);
  viewMonth = signal<Date>(this.startOfMonth(new Date()));
  selectedDateKey = signal<string | null>(null);
  selectedSlotId = signal<number | null>(null);

  weekdays = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

  slotsByDate = computed(() => {
    const map = new Map<string, AvailableSlot[]>();
    for (const slot of this.allSlots()) {
      if (slot.isBooked) continue;
      const key = this.dateKey(new Date(slot.startTime));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(slot);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    }
    return map;
  });

  calendarDays = computed<CalendarDay[]>(() => {
    const month = this.viewMonth();
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstOfMonth = new Date(year, m, 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(year, m, 1 - startOffset);
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayKey = this.dateKey(today);
    const slotsMap = this.slotsByDate();

    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const key = this.dateKey(d);
      days.push({
        date: d,
        dayNumber: d.getDate(),
        inCurrentMonth: d.getMonth() === m,
        hasSlots: slotsMap.has(key),
        isToday: key === todayKey,
        isPast: d < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      });
    }
    return days;
  });

  selectedDaySlots = computed<AvailableSlot[]>(() => {
    const key = this.selectedDateKey();
    if (!key) return [];
    return this.slotsByDate().get(key) ?? [];
  });

  ngOnInit(): void {
    const doctorId = this.appointment.doctorId;
    if (!doctorId) {
      this.errorMsg.set('تعذر تحديد الطبيب لهذا الموعد.');
      this.loadingSlots.set(false);
      return;
    }

    this.appointmentService.getAvailableSlots(doctorId).subscribe({
      next: (slots) => {
        this.allSlots.set(slots ?? []);
        this.loadingSlots.set(false);
        this.autoSelectFirstAvailableDay();
      },
      error: () => {
        this.errorMsg.set('حصل خطأ أثناء تحميل المواعيد المتاحة.');
        this.loadingSlots.set(false);
      },
    });
  }

  private autoSelectFirstAvailableDay(): void {
    const firstDay = this.calendarDays().find((d) => d.hasSlots && d.inCurrentMonth);
    if (firstDay) this.selectedDateKey.set(this.dateKey(firstDay.date));
  }

  private startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  private dateKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  prevMonth(): void {
    const m = this.viewMonth();
    this.viewMonth.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const m = this.viewMonth();
    this.viewMonth.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  selectDay(day: CalendarDay): void {
    if (!day.hasSlots || day.isPast) return;
    this.selectedDateKey.set(this.dateKey(day.date));
    this.selectedSlotId.set(null);
  }

  selectSlot(slot: AvailableSlot): void {
    this.selectedSlotId.set(slot.id);
  }

  isDaySelected(day: CalendarDay): boolean {
    return this.selectedDateKey() === this.dateKey(day.date);
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  monthLabel(): string {
    return this.viewMonth().toLocaleDateString('ar-EG', {
      month: 'long',
      year: 'numeric',
    });
  }

  confirm(): void {
    const slotId = this.selectedSlotId();
    if (!slotId || !this.appointment.id) return;

    this.submitting.set(true);
    this.errorMsg.set(null);

    this.appointmentService
      .reschedule(this.appointment.id, { newDoctorAvailabilityId: slotId })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          // بعض الـ endpoints بترجع الموعد ملفوف جوه { success, message, data }
          // بدل ما يرجع مباشر - السطر ده بيتعامل مع الحالتين لحد ما نتأكد من الشكل الفعلي
          const updated = ((res as any)?.data ?? res) as Appointment;
          this.rescheduled.emit(updated);
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMsg.set(
            err?.error?.message || 'تعذر إعادة جدولة الموعد، حاول مرة أخرى.'
          );
        },
      });
  }

  dismiss(): void {
    if (this.submitting()) return;
    this.closed.emit();
  }
}