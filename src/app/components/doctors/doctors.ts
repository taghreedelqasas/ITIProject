import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';
import { Doctor as ApiDoctor } from '../../core/models/doctor.model';
import { ReviewService } from '../../core/services/review.service';

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
    private reviewService: ReviewService
  ) {}

  pageTitle = 'الأطباء';
  pageSubtitle = 'ابحث عن طبيبك المناسب من بين أكثر من 200 متخصص';

  specialties = [
    'طب عام',
    'جراحة العظام',
    'أمراض القلب',
    'الجلدية',
    'الأطفال',
    'النساء والتوليد',
    'الأنف والأذن والحنجرة',
    'المخ والأعصاب',
    'الأسنان'
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

  // كود المابينج الخاص بك من جيت هاب بدون أي تغيير
private mapDoctor(d: ApiDoctor): Doctor {
  const name =
    d.name || d.fullName || [d.firstName, d.lastName].filter(Boolean).join(' ') || 'طبيب';
  
  // التعديل الجديد: التحقق من أن الصورة ليست null وليست نصاً فارغاً
  const hasImage = d.imageProfile && d.imageProfile.trim() !== '';

  return {
    id: d.id,
    name: name.startsWith('د.') ? name : `د. ${name}`,
    specialty: (d.departmentName || d.specialty || 'طبيب عام') as string,
    detail: d.consultationFee ? `الكشف - ${d.consultationFee} جنيه` : 'الكشف - غير محدد',
    rating: d.rating ?? 0,
    image: hasImage ? d.imageProfile! : FALLBACK_IMAGE, // حماية كاملة هنا
    isFavorite: false,
  };
}

  // الدالة بعد تعديلها بالكامل لتنفيذ الفلترة في الفرونت إند
  private fetchDoctors(): void {
  this.isLoading = true;
  this.errorMessage = '';

  // 1. جلب البيانات كاملة من السيرفر
  this.doctorService.getAll({}).subscribe({
    next: (res: any[]) => {
      console.log('بيانات الأطباء من السيرفر:', res);

      // 2. عمل Mapping للداتا الأصلية
      let allDoctors = (res || []).map((d) => this.mapDoctor(d));
      this.enrichWithRealRatings(allDoctors);

      // 3. فلترة التخصص (departmentName)
      if (this.selectedSpecialty) {
        allDoctors = allDoctors.filter(
          (doc) => doc.specialty === this.selectedSpecialty
        );
      }

      // 4. فلترة الموقع (address)
      if (this.selectedLocation) {
        allDoctors = allDoctors.filter((doc) => {
          const originalDoc = res.find((r) => r.id === doc.id);
          const docAddress = originalDoc?.address || '';
          return docAddress.toLowerCase().includes(this.selectedLocation.toLowerCase());
        });
      }

      // 5. فلترة البحث النصي (الاسم)
      if (this.searchQuery) {
        allDoctors = allDoctors.filter((doc) =>
          doc.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      // ===== 🚀 التعديل الجديد: منطق الترتيب (Sorting) جوه الفرونت-إند =====
      if (this.selectedSort) {
        allDoctors.sort((a, b) => {
          // استخراج الأرقام فقط من خانة الكشف (مثلاً "الكشف - 450 جنيه" بناخد الـ 450)
          const priceA = parseInt(a.detail.replace(/[^0-9]/g, '')) || 0;
          const priceB = parseInt(b.detail.replace(/[^0-9]/g, '')) || 0;

          if (this.selectedSort === 'price-asc') {
            return priceA - priceB; // من الأقل سعراً للأعلى
          } else if (this.selectedSort === 'price-desc') {
            return priceB - priceA; // من الأعلى سعراً للأقل
          } else if (this.selectedSort === 'rating') {
            return b.rating - a.rating; // أعلى تقييم أولاً
          }
          return 0;
        });
      }

      // إرسال البيانات النهائية المرتبة والمفلترة للعرض
      this.doctors = allDoctors;
      this.totalDoctorsLabel = `${this.doctors.length} طبيب متاح`;
      this.isLoading = false;
      console.log('البيانات بعد الفلترة والترتيب بالكامل:', this.doctors);
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery || null,
        specialty: this.selectedSpecialty || null,
        location: this.selectedLocation || null,
        date: this.selectedDate || null,
        sort: this.selectedSort || null
      },
      queryParamsHandling: 'merge'
    });

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
  private enrichWithRealRatings(doctors: Doctor[]): void {
  doctors.forEach((doc) => {
    this.reviewService.getDistribution(doc.id).subscribe({
      next: (res: any) => {
        const dist = res?.data ?? res;
        if (dist && typeof dist === 'object' && dist.averageRating != null) {
          doc.rating = dist.averageRating;
        }
      },
      error: () => {},
    });
  });
}
}