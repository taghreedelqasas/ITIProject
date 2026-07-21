import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
 
interface Doctor {
  name: string;
  specialty: string;
  rating: string;
  photo: string;
  raised: boolean;
  dark: boolean;
}
@Component({
  selector: 'app-landing-page-sec4',
  imports: [CommonModule,RouterLink],
  templateUrl: './landing-page-sec4.html',
  styleUrl: './landing-page-sec4.css',
})
export class LandingPageSec4 {
  doctors: Doctor[] = [
    {
      name: 'د. كريم منصور',
      specialty: 'استشاري طب القلب والأوعية الدموية',
      rating: '4.8',
      photo: 'doctors/28b7b241688affc93f6215e2dc7f75453f4c832e.jpg',
      raised: false,
      dark: false,
    },
    {
      name: 'د. نورا حسن',
      specialty: 'استشارية طب وجراحة العظام',
      rating: '4.9',
      photo: 'doctors/69b86d783612d08cf7e065439f21945fa52df410.jpg',
      raised: true,
      dark: true,
    },
    {
      name: 'د. سارة إبراهيم',
      specialty: 'استشارية طب الأطفال',
      rating: '5.0',
      photo: 'doctors/9900810c218183e5f6fe6b81a3e031a9e2bddc65.jpg',
      raised: false,
      dark: true,
    },
    {
      name: 'د. عمر فراح',
      specialty: 'استشاري طب الجهاز الهضمي والكبد',
      rating: '4.8',
      photo: 'doctors/f52e2ef13300970c42fa480b12fd68ff99d63133.jpg',
      raised: true,
      dark: false,
    },
    {
      name: 'د. سارة إبراهيم',
      specialty: 'استشارية أمراض الجلدية',
      rating: '4.7',
      photo: 'doctors/f4038608bc5fb23f474a0ffc80fbcf3458908833.png',
      raised: false,
      dark: false,
    },
  ];
}
