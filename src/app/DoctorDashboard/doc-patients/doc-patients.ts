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
  patientDetails: { phone: string; age: string; gender: string } = { phone: '—', age: '—', gender: '—' };
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
    this.drawerOpen = true;

    // 1. البحث عن الحجز الخاص بهذا المريض لاستخراج الـ notes
    const allAppointments = this.appointmentService.appointments() || [];
    const patientAppointment = allAppointments.find((app: any) => app.patientId === patient.id);
    
    const notesString = patientAppointment?.notes || '';
    console.log("الـ notes اللي لقيناها للمريض:", notesString);

    // 2. تحليل واستخراج البيانات (الهاتف، العمر، الجنس) باستخدام الـ Regex
    this.patientDetails = {
      phone: notesString.match(/التليفون:\s*([^\n\r]+)/)?.[1]?.trim() || '—',
      age: notesString.match(/العمر:\s*([^\n\r]+)/)?.[1]?.trim() ? notesString.match(/العمر:\s*([^\n\r]+)/)?.[1]?.trim() + ' سنة' : '—',
      gender: '—'
    };

    const g = notesString.match(/الجنس:\s*([^\n\r]+)/)?.[1]?.trim()?.toLowerCase();
    if (g) {
      this.patientDetails.gender = (g === 'male' || g === 'ذكر') ? 'ذكر' : 'أنثى';
    }

    console.log("البيانات النهائية المستخرجة للكروت:", this.patientDetails);

    // 3. جلب المرفقات والملفات الطبية الخاصة بالمريض وتنظيف روابطها
    this.medicalFileService
      .getDoctorFiles(patient.id)
      .subscribe({
        next: (res) => {
          const sanitizedFiles = res.map((file: any) => {
            let finalUrl = file.fileUrl || '';
            if (finalUrl.startsWith('/uploads')) {
              finalUrl = this.baseUrl + finalUrl;
            } else if (finalUrl.includes('https://mawed.runasp.nethttps')) {
              finalUrl = finalUrl.replace('https://mawed.runasp.nethttps//', 'https://');
            }
            return { ...file, fileUrl: finalUrl };
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

  // دالة لاستخراج البيانات من حقل الـ notes القادم من السيرفر
  parsePatientNotes(notesString: string | null): { phone: string; gender: string; age: string } {
    const data = { phone: '—', gender: '—', age: '—' };
    if (!notesString) return data;

    // استخراج التليفون
    const phoneMatch = notesString.match(/التليفون:\s*([^\n]+)/);
    if (phoneMatch) data.phone = phoneMatch[1].trim();

    // استخراج الجنس
    const genderMatch = notesString.match(/الجنس:\s*([^\n]+)/);
    if (genderMatch) {
      const g = genderMatch[1].trim().toLowerCase();
      data.gender = g === 'male' || g === 'ذكر' ? 'ذكر' : 'أنثى';
    }

    // استخراج العمر
    const ageMatch = notesString.match(/العمر:\s*([^\n]+)/);
    if (ageMatch) data.age = ageMatch[1].trim() + ' سنة';

    return data;
  }
}