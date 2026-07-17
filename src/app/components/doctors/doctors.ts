import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';
import { Doctor as ApiDoctor } from '../../core/models/doctor.model';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  detail: string;
  rating: number;
  image: string;
  isFavorite: boolean;
}

interface SortOption {
  label: string;
  value: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&q=80';

@Component({
  selector: 'app-doctors',
  imports: [CommonModule, FormsModule],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css',
})
export class Doctors implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private doctorService: DoctorService,
  ) {}

  pageTitle = 'الأطباء';
  pageSubtitle = 'ابحث عن طبيبك المناسب من بين أكثر من 200 متخصص';

  specialties: string[] = [
    'جراحة العظام',
    'أمراض القلب',
    'الجلدية',
    'الأطفال',
    'النساء والتوليد',
    'الأنف والأذن والحنجرة',
    'المخ والأعصاب',
    'الأسنان',
  ];

  searchQuery = '';
  selectedSpecialty = '';
  selectedLocation = '';
  selectedDate = '';

  sortOptions: SortOption[] = [
    { label: 'أعلى تقييم', value: 'rating' },
    { label: 'أقرب موعد', value: 'soonest' },
    { label: 'أعلى سعر', value: 'price-desc' },
    { label: 'أدنى سعر', value: 'price-asc' },
  ];
  selectedSort = 'rating';

  isLoading = false;
  errorMessage = '';

  totalDoctorsLabel = '0 طبيب متاح';

  doctors: Doctor[] = [];

  starsArray = [1, 2, 3, 4, 5];

  pages: (number | string)[] = [1];
  currentPage = 1;

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.searchQuery = params['search'] || '';
    this.selectedSpecialty = params['specialty'] || '';
    this.selectedLocation = params['location'] || '';
    this.selectedDate = params['date'] || '';

    this.fetchDoctors();
  }
 private mapDoctor(d: ApiDoctor): Doctor {
  const name =
    d.name || d.fullName || [d.firstName, d.lastName].filter(Boolean).join(' ') || 'طبيب';
  
  return {
    id: d.id,
    name: name.startsWith('د.') ? name : `د. ${name}`,
    specialty: (d.specialty || d.departmentName || 'طبيب عام') as string,
    detail: d.consultationFee ? `الكشف - ${d.consultationFee}` : 'الكشف - غير محدد',
    rating: d.rating ?? 0,
    // هنا نضمن قراءة الصورة الحقيقية القادمة من السيرفر (imageProfile)
    // وإذا كانت فارغة أو غير موجودة نضع الصورة الافتراضية
    image: d.imageProfile ? d.imageProfile : FALLBACK_IMAGE,
    isFavorite: false,
  };
}
  private fetchDoctors(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // نداء API: GET /api/Doctor مع فلاتر البحث/التخصص/الموقع/التاريخ
    this.doctorService
      .getAll({
        search: this.searchQuery || undefined,
        specialty: this.selectedSpecialty || undefined,
        location: this.selectedLocation || undefined,
        date: this.selectedDate || undefined,
        sort: this.selectedSort || undefined,
      })
      .subscribe({
        next: (res) => {
          this.doctors = (res || []).map((d) => this.mapDoctor(d));
          this.totalDoctorsLabel = `${this.doctors.length} طبيب متاح`;
          this.isLoading = false;
          console.log('بيانات الأطباء من السيرفر:', res);
        },
        error: () => {
          this.errorMessage = 'تعذر تحميل قائمة الأطباء، حاول مرة أخرى.';
          this.isLoading = false;
        },
      });
  }

  selectSort(value: string): void {
    this.selectedSort = value;
    this.fetchDoctors();
  }

  toggleFavorite(doctor: Doctor): void {
    doctor.isFavorite = !doctor.isFavorite;
  }

  goToPage(page: number | string): void {
    if (typeof page !== 'number') return;
    this.currentPage = page;
  }

  onSearch(): void {
    // نداء API: GET /api/Doctor بفلاتر البحث
    this.fetchDoctors();
  }

  onChatWithDoctor(doctor: Doctor): void {
    this.router.navigate(['consult'], {
      queryParams: {
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        image: doctor.image,
      },
    });
  }

  viewDoctorProfile(doctor: Doctor): void {
    this.router.navigate(['/doctor', doctor.id]);
  }

  onBookAppointment(doctor: Doctor): void {
    this.router.navigate(['/booking'], {
      queryParams: { doctorId: doctor.id },
    });
  }

  onChatDoctor(doctor: Doctor): void {
    this.router.navigate(['/chat'], {
      queryParams: {
        doctorId: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        image: doctor.image,
      },
    });
  }
}
