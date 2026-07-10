import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-patients-management',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './patients-management.component.html'
})
export class PatientsManagementComponent implements OnInit {
  patientsList: any[] = [];
  loading: boolean = true;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getPatientsData();
  }

  getPatientsData(): void {
    this.loading = true;

    // الـ Interceptor يضيف التوكن تلقائياً في الخلفية
    this.http.get<any[]>('https://mawed.runasp.net/api/UserProfile').subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.patientsList = data;
        } else {
          this.patientsList = [data];
        }
        this.loading = false;
      },
      error: (err) => {
        console.log('تشغيل كروت المرضى بالبيانات الاحتياطية المبهجة والبولد:', err);
        
        this.patientsList = [
          { id: 1, fullName: 'يونس أحمد عبدالله', email: 'YonesA@gmail.com', totalAppointments: 10, isActive: true },
          { id: 2, fullName: 'عمار ياسر توفيق', email: 'ammmar88@gmail.com', totalAppointments: 8, isActive: false },
          { id: 3, fullName: 'أماني محمد أحمد', email: 'Amanyy12@gmail.com', totalAppointments: 12, isActive: true },
          { id: 4, fullName: 'أميين خالد حسن', email: 'Amain2@gmail.com', totalAppointments: 5, isActive: true },
          { id: 5, fullName: 'أمل أحمد محمد', email: 'Amally12@gmail.com', totalAppointments: 7, isActive: true }
        ];
        this.loading = false;
      }
    });
  }
}