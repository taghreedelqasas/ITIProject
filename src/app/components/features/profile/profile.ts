import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../DoctorDashboard/services/appointment';
import { UpdateProfileDto } from '../../../DoctorDashboard/services/dashboard';

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

  userData = {
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: 'Female'
  };

  ngOnInit(): void {
    this.getProfile();
  }

  getProfile() {
    this.patientServices.getUserProfile().subscribe({
      next: (res: any) => {

        this.patientServices.userProfile.set(res);
          console.log(typeof res.gender);
          console.log(this.userData.gender);
        this.userData = {
          fullName: res.fullName,
          email: res.email,
          phone: res.phoneNumber,
          birthDate: res.birthDate?.split('T')[0],
          gender: res.gender
        };
      },
      error: (err) => console.log(err)
    });
  }

  toggleEdit() {
    this.isEditing = true;
    console.log(this.isEditing);
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
  next: (res) => {
    console.log(res);
    this.isEditing = false;
    this.getProfile();
  },
  error: (err) => console.log(err)
});
  }

}