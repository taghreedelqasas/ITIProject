import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment';

@Component({
  selector: 'app-doc-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-patients.html',
  styleUrl: './doc-patients.css'
})
export class DocPatients implements OnInit {
  protected appointmentService = inject(AppointmentService);
  searchQuery = signal<string>('');

  ngOnInit(): void {
    this.appointmentService.getDoctorAppointments(); // بدل getPatientsData القديمة
  }

  // فلترة بالاسم بس دلوقتي (فلترة رقم التليفون اتشالت لأنه وهمي حاليًا)
  filteredPatients = computed(() => {
    const list = this.appointmentService.uniquePatients();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return list;
    return list.filter(p => p.name.toLowerCase().includes(query));
  });
}