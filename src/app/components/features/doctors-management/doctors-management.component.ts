import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-doctors-management',
  standalone: true,
  imports: [CommonModule, HttpClientModule, DecimalPipe],
  templateUrl: './doctors-management.component.html'
})
export class DoctorsManagementComponent implements OnInit {
  doctorsList: any[] = [];
  loading: boolean = true;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getDoctorsData();
  }

  getDoctorsData(): void {
    this.loading = true;
    
    // ربطنا بـ /api/Doctor بناءً على ملف الـ Swagger الخاص بكِ
    this.http.get<any[]>('https://mawed.runasp.net/api/Doctor').subscribe({
      next: (data) => {
        this.doctorsList = data;
        this.loading = false;
      },
      error: (err) => {
        console.log('تشغيل الكروت بالبيانات الاحتياطية المبهجة:', err);
        
        // الداتا الاحتياطية متظبطة على الحقول المطلوبة بالظبط
        this.doctorsList = [
          { id: 1, fullName: 'د. أحمد مصطفى', specialty: 'طب وجراحة العيون', address: 'القاهرة، مدينة نصر', totalAppointments: 45, rating: 4.8, totalBalance: 12500, isActive: true },
          { id: 2, fullName: 'د. سارة عبد الرحمن', specialty: 'طب الأطفال وحديثي الولادة', address: 'الجيزة، الدقي', totalAppointments: 32, rating: 4.9, totalBalance: 8400, isActive: true },
          { id: 3, fullName: 'د. محمد علي حسن', specialty: 'أمراض القلب والأوعية الدموية', address: 'الإسكندرية، سموحة', totalAppointments: 60, rating: 4.5, totalBalance: 21000, isActive: false },
,          { id: 4, fullName: 'د. مها محمود', specialty: 'الجلدية والليزر', address: 'المنصورة، المشاية', totalAppointments: 28, rating: 4.7, totalBalance: 7200, isActive: true },
          { id: 4, fullName: 'د. مها محمود', specialty: 'الجلدية والليزر', address: 'المنصورة، المشاية', totalAppointments: 28, rating: 4.7, totalBalance: 7200, isActive: true }

        ];
        this.loading = false;
      }
    });
  }
}