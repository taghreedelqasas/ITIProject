import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../services/appointment';

@Component({
  selector: 'app-doc-slots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doc-slots.html',
  styleUrl: './doc-slots.css'
})
export class DocSlots implements OnInit {
  protected appointmentService = inject(AppointmentService);
  
  filters = ['الكل', 'حضر', 'لم يحضر', 'قادم', 'في الانتظار'];
  daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  ngOnInit(): void {
    this.appointmentService.loadDashboardData();
    this.appointmentService.getAvailableSlots(1); 
  }

  setFilter(status: string) {
    this.appointmentService.selectedStatusFilter.set(status);
  }

  getArabicDayName(dateString: string): string {
    if (!dateString.includes('T') && isNaN(Date.parse(dateString))) {
      return dateString; 
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { weekday: 'long' });
  }

  formatTime(dateString: string): string {
    if (!dateString.includes('T') && isNaN(Date.parse(dateString))) {
      return dateString; 
    }
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  // هنا حلينا مشكلة الـ filter بوضع شيك أمان (slots || []) لمنع ضرب الـ undefined
  getSlotsByDay(day: string) {
    const slots = this.appointmentService.availableSlots();
    if (!slots) return []; // لو السجنال لسه null، بيرجع مصفوفة فاضية وميضربش
    
    return slots.filter(slot => {
      const slotDay = slot.startTime.includes('||') ? slot.startTime.split('||')[0] : this.getArabicDayName(slot.startTime);
      return slotDay === day;
    });
  }

  // هنا حلينا مشكلة الـ slots is not iterable
  onAddSlotClick(defaultDay: string = 'الأحد') {
    const dayInput = prompt('أدخل اليوم المراد إضافة الوقت له (الأحد، الإثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت):', defaultDay);
    
    if (dayInput && this.daysOfWeek.includes(dayInput.trim())) {
      const timeInput = prompt(`أدخل الوقت المطلوب ليوم (${dayInput.trim()}) \nمثال: "04:30 م"`);
      
      if (timeInput && timeInput.trim() !== '') {
        const customValue = `${dayInput.trim()}||${timeInput.trim()}`;
        
        const newSlot = {
          availabilityId: Math.floor(Math.random() * 100000), 
          startTime: customValue,
          endTime: customValue 
        };

        // شيك أمان: لو الـ slots قيمتها الحالية null أو مش مصفوفة، بنبدأ بمصفوفة فاضية عشان نـ spread جواها بأمان
        this.appointmentService.availableSlots.update(slots => {
          const currentSlots = Array.isArray(slots) ? slots : [];
          return [...currentSlots, newSlot];
        });
      }
    } else if (dayInput) {
      alert('يرجى إدخال يوم صحيح متواجد في القائمة.');
    }
  }

  onDeleteSlotClick(availabilityId: number) {
    if (confirm('هل أنتِ متأكدة من رغبتكِ في حذف هذا الوقت المتاح؟')) {
      this.appointmentService.availableSlots.update(slots => {
        const currentSlots = Array.isArray(slots) ? slots : [];
        return currentSlots.filter(slot => slot.availabilityId !== availabilityId);
      });
    }
  }
}