import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment';
import { MedicalFileService } from '../../core/services/medicalFile.service';

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
  selectedPatient: any = null;
  patientFiles = signal<any[]>([]);

  baseUrl = "https://mawed.runasp.net"; //[cite: 17]
  drawerOpen = false;

  ngOnInit(): void {
    this.appointmentService.getDoctorAppointments(); //[cite: 17]
    console.log(this.appointmentService.getDoctorAppointments()); //[cite: 17]
  }

  medicalFileService = inject(MedicalFileService);

  filteredPatients = computed(() => {
    const list = this.appointmentService.uniquePatients();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return list;
    return list.filter(p => p.name.toLowerCase().includes(query));
  });

  openPatient(patient: any) {
    this.selectedPatient = patient;
    console.log(this.selectedPatient);
    this.drawerOpen = true;

    this.medicalFileService
      .getDoctorFiles(patient.id)
      .subscribe({
        next: (res) => {
          // ===== معالجة وتنظيف الروابط هنا قبل ما تتبعت للـ HTML =====
          const sanitizedFiles = res.map((file: any) => {
            let finalUrl = file.fileUrl || '';

            // إذا كان المسار نسبي يبدأ بـ /uploads ندمج مع الـ baseUrl
            if (finalUrl.startsWith('/uploads')) {
              finalUrl = this.baseUrl + finalUrl;
            }
            // إذا حصل تكرار للدومين بسبب دمج قديم خاطئ نقوم بتنظيفه
            else if (finalUrl.includes('https://mawed.runasp.nethttps')) {
              finalUrl = finalUrl.replace('https://mawed.runasp.nethttps//', 'https://');
            }

            return {
              ...file,
              fileUrl: finalUrl // الرابط المعدّن والنظيف
            };
          });

          this.patientFiles.set(sanitizedFiles);
        }
      });
  }

  closeDrawer() {
    this.drawerOpen = false;
  }

  // دالة مساعدة لو بتفتح الملفات بـ click وجوه الـ TS مباشرة
  viewFile(fileUrl: string) {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      alert('رابط الملف غير متاح');
    }
  }
}