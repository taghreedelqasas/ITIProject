import { Component, OnInit, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'; // تأكدي من صحة المسار في مشروعكِ
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AppointmentService } from '../../DoctorDashboard/services/appointment';
import { Gender } from '../../DoctorDashboard/services/dashboard';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  isMenuOpen = false;
  isUserDropdownOpen = false; // التحكم بفتح وإغلاق القائمة المنسدلة
  userAvatar = '/images/22.jpg'; // الصورة الافتراضية للمريض
  protected userInfoService = inject(AppointmentService) ; 
  constructor(private router: Router, public authService: AuthService) {}
  userData: {
    fullName: string;
    email: string;
    phone: string;
    birthDate: string;
    gender: Gender;
  } = {
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: Gender.Male // = 1
  };

    getProfile() {
    this.userInfoService.getUserProfile().subscribe({
      next: (res: any) => {
        this.userInfoService.userProfile.set(res);
        this.userData = {
          fullName: res.fullName,
          email: res.email,
          phone: res.phoneNumber,
          birthDate: res.birthDate?.split('T')[0],
          // الباك إند بيرجع الـ enum كرقم (1 أو 2)، لو رجع string لأي سبب بنحولها بأمان
          gender: typeof res.gender === 'number' ? res.gender : Gender.Male
        };
      },
      error: (err) => console.log(err)
    });
  }
  ngOnInit(): void {
   if (this.authService.isLoggedIn()) {
      this.getProfile();
    }
    // نعتمد تماماً على الـ Getters بالأسفل لجلب البيانات ديناميكياً لتجنب مشاكل الـ refresh
  }

  // جلب اسم المريض المسجل ديناميكياً من الـ localStorage
  getUserName(): string {
    return this.userData.fullName || 'جاري التحميل...';
  }

  // جلب إيميل المريض ديناميكياً من الـ localStorage
  getUserEmail(): string {
    return localStorage.getItem('userEmail') || 'patient@example.com';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // فتح وإغلاق القائمة المنسدلة
  toggleUserDropdown(event: Event) {
    event.stopPropagation(); // منع إغلاق القائمة فور النقر عليها
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  // إغلاق القائمة تلقائياً عند الضغط في أي مكان خارجها بالصفحة
@HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const target = event.target as HTMLElement;
    // إذا ضغط المستخدم في أي مكان خارج زر القائمة، يتم إغلاقها
    if (!target.closest('button')) {
      this.isUserDropdownOpen = false;
    }
  }
  scrollToSection(sectionId: string) {
    this.isMenuOpen = false;

    if (this.router.url === '/') {
      this.scrollNow(sectionId);
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scrollNow(sectionId), 150);
      });
    }
  }

  private scrollNow(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onLogout(event: Event): void {
    event.preventDefault(); 
    this.isUserDropdownOpen = false;

    Swal.fire({
      title: 'تسجيل الخروج',
      text: 'هل تريد بالتأكيد تسجيل الخروج من هذا الحساب؟',
      width: '560px', 
      showCancelButton: true,
      confirmButtonText: 'تسجيل الخروج',
      cancelButtonText: 'إلغاء',
      reverseButtons: true, 
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        htmlContainer: 'swal-custom-text',
        confirmButton: 'swal-custom-confirm',
        cancelButton: 'swal-custom-cancel',
        actions: 'swal-custom-actions'
      },
      buttonsStyling: false 
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.finishLogout();
      }
    });
  }

  private finishLogout(): void {
    localStorage.clear(); // تنظيف كامل البيانات لزيادة الأمان
    this.router.navigate(['/']);
  }
}