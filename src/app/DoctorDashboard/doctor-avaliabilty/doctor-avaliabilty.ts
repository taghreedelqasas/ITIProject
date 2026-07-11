import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { DoctorAvailabilityService } from '../../DoctorDashboard/services/doctor-availability.service';
import {
  DoctorAvailability,
  CreateDoctorAvailabilityDto,
  UpdateDoctorAvailabilityDto
} from '../../core/models/doctor-availability';

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
errorMessage = signal('');
  private fb = inject(FormBuilder);

  service = inject(DoctorAvailabilityService);

  doctorId = 3;

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

  }

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

    if(this.form.invalid){

      this.form.markAllAsTouched();

      return;

    }

    this.saving.set(true);

    if(this.editMode()){

      const dto: UpdateDoctorAvailabilityDto={

        id:this.selectedId(),

        startTime:this.form.value.startTime!,

        endTime:this.form.value.endTime!

      };

      this.service.update(dto).subscribe({

        next:()=>{

          this.closeModal();

          this.loadSlots();

        },

        error:(err)=>{

           this.errorMessage.set(err.error?.message ?? 'حدث خطأ');

          this.saving.set(false);

        },

        complete:()=>{

          this.saving.set(false);

        }

      });

    }

    else{

      const dto:CreateDoctorAvailabilityDto={

        doctorId:this.doctorId,

        startTime:this.form.value.startTime!,

        endTime:this.form.value.endTime!

      };

      this.service.create(dto).subscribe({

        next:()=>{

          this.closeModal();

          this.loadSlots();

        },

        error:(err)=>{

           this.errorMessage.set(err.error?.message ?? 'حدث خطأ');

          this.saving.set(false);

        },

        complete:()=>{

          this.saving.set(false);

        }

      });

    }

  }
    delete(slot: DoctorAvailability) {

    if (!confirm('هل تريد حذف هذا الموعد؟')) {
      return;
    }

    this.service.delete(slot.id).subscribe({

      next: () => {

        this.loadSlots();

      },

      error: (err) => {

       this.errorMessage.set(err.error?.message ?? ' تعذر حذف الموعد');

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

  this.slots().forEach(slot => {

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
}