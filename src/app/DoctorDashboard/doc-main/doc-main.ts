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
  this.dashService.getWallet() ;
  this.dashService.totalEarnings() ;
  this.dashService.getWalletTransactions(); 
}


  todayAppointments() {
    const today = new Date().toDateString();
    return this.dashService.appointments().filter(
      a => new Date(a.slotStart).toDateString() === today
    );
  }

  formatShortTime(date: string): string {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}