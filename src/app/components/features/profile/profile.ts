import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // مهم جداً عشان الـ *ngIf
import { FormsModule } from '@angular/forms'; // مهم جداً عشان الـ [(ngModel)] و ngForm

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class UserProfileComponent {
  isEditing: boolean = false;

  userData = {
    fullName: 'يونس أحمد عبدالله',
    email: 'yonesA@gmail.com',
    phone: '01115887563',
    birthDate: '1990-03-13',
    gender: 'ذكر',
    address: 'القاهرة، المعادي، شارع 9'
  };

  toggleEdit() {
    this.isEditing = true;
  }

  // بتتنادى دلوقتي من (ngSubmit) على الـ form مش من (click) على الزرار
  // فـ Angular بيتأكد إن الفورم صحيحة (Validation) قبل ما ينفذ الدالة أصلاً
  saveData() {
    this.isEditing = false;
    // ملحوظة مستقبلية: هنا هنربط مع الـ API لحفظ البيانات المعدلة
    console.log('تم حفظ البيانات بنجاح:', this.userData);
  }
}