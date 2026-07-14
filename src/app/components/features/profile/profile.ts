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
      gender: this.userData.gender // رقم فعلي (1 أو 2)، مطابق للـ enum بتاع الباك إند
    };

    this.patientServices.updateUserProfile(body).subscribe({
      next: (res) => {
        this.isEditing = false;
        this.getProfile();
      },
      error: (err) => console.log(err)
    });
  }
}