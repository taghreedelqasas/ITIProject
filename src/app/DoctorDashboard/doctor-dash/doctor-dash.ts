import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AppointmentService } from '../services/appointment';
import { AuthService } from '../../core/services/auth.service'; // ظبطي المسار حسب مكان الملف عندك

@Component({
  selector: 'app-doctor-dash',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './doctor-dash.html',
  styleUrl: './doctor-dash.css'
})
export class DoctorDash implements OnInit {
  protected dashService = inject(AppointmentService);
   constructor( public authService: AuthService) {}

onLogout(): void {
  
  this.authService.logout();
  this.finishLogout();
}

private finishLogout(): void {
  localStorage.removeItem('token');

}

  ngOnInit(): void {
    // استخدمي userProfile (حقيقي 100%) بدل doctor() في الـ Header/الترحيب
    if (!this.dashService.userProfile()) {
      this.dashService.getUserProfile();
    }
  }
}