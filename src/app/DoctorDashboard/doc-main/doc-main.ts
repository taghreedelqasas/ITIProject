import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../services/appointment';

@Component({
  selector: 'app-doc-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doc-main.html',
  styleUrl: './doc-main.css'
})
export class DocMain implements OnInit {
  protected dashService = inject(AppointmentService);
ngOnInit(): void {
  this.dashService.getUserProfile().subscribe({
    next: (res) => {
      this.dashService.userProfile.set(res);
      console.log(res.fullName);
    },
    error: (err) => console.error(err)
  });
  this.dashService.getDoctorAppointments() ; 
}
}