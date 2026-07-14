import { Component, inject, OnInit } from '@angular/core';
import { AppointmentService } from '../../DoctorDashboard/services/appointment';
import { RouterOutlet, RouterLinkWithHref, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar-patient',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './navbar-patient.html',
  styleUrl: './navbar-patient.css',
})
export class NavbarPatient implements OnInit {
   protected  patientServices = inject(AppointmentService)
  ngOnInit(): void {
      this.patientServices.getUserProfile().subscribe({
    next: (res) => {
      this.patientServices.userProfile.set(res);
      console.log(res.fullName);
    },
    error: (err) => console.error(err)
  });
  }

}
