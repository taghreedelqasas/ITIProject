import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../services/appointment';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-doc-consultations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doc-consulations.html',
  styleUrl: './doc-consulations.css'
})
export class DocConsultations implements OnInit {
  protected appointmentService = inject(AppointmentService);
   
  ngOnInit(): void {
      
      this.appointmentService.getDoctorConversations() ; 
  }
}