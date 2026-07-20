import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../services/appointment';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexStroke,
  ApexXAxis,
  ApexDataLabels,
  ApexGrid,
  ApexFill
} from "ng-apexcharts";
@Component({
  selector: 'app-doc-main',
  standalone: true,
  imports: [CommonModule,RouterLink,NgApexchartsModule],
  templateUrl: './doc-main.html',
  styleUrl: './doc-main.css'
})
export class DocMain implements OnInit {
  protected dashService = inject(AppointmentService);
 chartOptions: any = null;
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
  this.dashService.getMyReviews() ;
  this.dashService.totalEarnings() ;
  this.dashService.getWalletTransactions(); 
}

private chartEffect = effect(() => {
  const appointments = this.dashService.appointments();

  if (appointments.length > 0) {
    this.updateChart();
  }
});
  todayAppointments() {
    const today = new Date().toDateString();
    return this.dashService.appointments().filter(
      a => new Date(a.slotStart).toDateString() === today
    );
  }

updateChart() {

  const data = this.dashService.bookingsGrowthComputed();

  this.chartOptions = {
     colors: ['#6CEAEA'],
    series: [
      {
        name: "المواعيد",
        data: data.map(x => x.count)
      }
    ],
chart: {
  type: 'area',
  height: '100%',
  width: '100%',
  sparkline: {
    enabled: false
  },
  toolbar: {
    show: false
  },
  zoom: {
    enabled: false
  }
} ,

    stroke: {
      curve: "smooth",
      width: 3
    },

    dataLabels: {
      enabled: false
    },

    xaxis: {
      categories: data.map(x => x.month)
    },

    grid: {
      borderColor: "#ECE7F0"
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: .3,
        opacityFrom: .3,
        opacityTo: 0
      }
    }

  };

}


  formatShortTime(date: string): string {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}