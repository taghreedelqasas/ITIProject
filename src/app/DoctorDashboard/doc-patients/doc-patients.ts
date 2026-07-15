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
selectedPatient:any=null;
patientFiles=signal<any[]>([]);

baseUrl="https://mawed.runasp.net";
drawerOpen=false;
  ngOnInit(): void {
    this.appointmentService.getDoctorAppointments(); 
    console.log(this.appointmentService.getDoctorAppointments());// بدل getPatientsData القديمة
  }
medicalFileService=inject(MedicalFileService);
  // فلترة بالاسم بس دلوقتي (فلترة رقم التليفون اتشالت لأنه وهمي حاليًا)
  filteredPatients = computed(() => {
    const list = this.appointmentService.uniquePatients();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return list;
    return list.filter(p => p.name.toLowerCase().includes(query));
  });


openPatient(patient:any){

this.selectedPatient=patient;
console.log(this.selectedPatient)
this.drawerOpen=true;

this.medicalFileService
.getDoctorFiles(patient.id)
.subscribe({

next:(res)=>{

this.patientFiles.set(res);

}

});

}

closeDrawer(){

this.drawerOpen=false;

}
}