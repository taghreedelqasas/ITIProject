import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../DoctorDashboard/services/appointment';
import { UpdateProfileDto, Gender } from '../../../DoctorDashboard/services/dashboard';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class UserProfileComponent implements OnInit {

  protected patientServices = inject(AppointmentService);

  isEditing = false;
  isUploadingImage = false;

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

  ngOnInit(): void {
    this.getProfile();
  }

  getProfile() {
    this.patientServices.getUserProfile().subscribe({
      next: (res: any) => {
        this.patientServices.userProfile.set(res);
        
        // Normalize gender: 1 = Male (ذكر), 2 = Female (أنثى)
        let genderVal = 1;
        if (res.gender !== undefined && res.gender !== null) {
          const rawGender = String(res.gender).toLowerCase();
          if (rawGender === 'female' || rawGender === '2' || (rawGender === '1' && Gender.Female === 1)) {
            genderVal = 2; // Female (أنثى)
          } else {
            genderVal = 1; // Male (ذكر)
          }
        }

        this.userData = {
          fullName: res.fullName,
          email: res.email,
          phone: res.phoneNumber,
          birthDate: res.birthDate?.split('T')[0],
          gender: genderVal as any
        };
      },
      error: (err) => console.log(err)
    });
  }

  // دالة اختيار الصورة ورفعها للسيرفر
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      this.isUploadingImage = true;
      this.patientServices.uploadProfilePicture(file).subscribe({
        next: () => {
          this.isUploadingImage = false;
          this.getProfile(); // إعادة جلب البيانات لتحديث الصورة في الواجهة
        },
        error: (err) => {
          this.isUploadingImage = false;
          console.error('حدث خطأ أثناء رفع الصورة:', err);
        }
      });
    }
  }

  toggleEdit() {
    this.isEditing = true;
  }

  saveData() {
    const names = this.userData.fullName.trim().split(' ');

    const body: UpdateProfileDto = {
      firstName: names[0] ?? undefined,
      lastName: names.slice(1).join(' ') || undefined,
      phoneNumber: this.userData.phone,
      birthDate: this.userData.birthDate,
      gender: this.userData.gender
    };

    this.patientServices.updateUserProfile(body).subscribe({
      next: () => {
        this.isEditing = false;
        this.getProfile();
      },
      error: (err) => console.log(err)
    });
  }
}