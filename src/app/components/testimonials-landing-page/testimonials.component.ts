import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  rating: number;
  avatar: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent {
  badgeLabel = 'آراء مرضانا';
  title = 'ماذا يقول مرضانا عن موعد؟';
  subtitle = 'أكثر من ١٠٠,٠٠٠ مريض يثقون في منصة موعد لرعايتهم الصحية';

  testimonials: Testimonial[] = [
    {
      quote: 'استخدمت المساعد الذكي عندما شعرت بأعراض غريبة. في دقيقتين حدد المشكلة ورشح لي أفضل طبيب وحجزت فوراً. تجربة مذهلة حقاً.',
      name: 'مصطفى محمد',
      location: 'الجيزة، مصر',
      rating: 4.5,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mostafa&backgroundColor=b6e3f4'
    },
    {
      quote: 'السجل الطبي الموحد مريح جداً! كل تقاريري ووصفاتي في مكان واحد. شاركت ملفي مع طبيبي الجديد في ثانية واحدة. أنصح به بشدة.',
      name: 'أحمد سامي',
      location: 'الإسكندرية، مصر',
      rating: 4.5,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed&backgroundColor=ffd5dc'
    },
    {
      quote: 'تصميم الموقع واضح جداً وسهل الاستخدام، وحتى والدتي قدرت تحجز موعد بنفسها بدون أي مساعدة.',
      name: 'فاطمة النجار',
      location: 'القاهرة، مصر',
      rating: 4.5,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatma&backgroundColor=ffdfbf'
    }
  ];

  // تعديل البداية لتكون من الصفر (أول كارت)
  activeSlide = 0; 

  setActiveSlide(index: number): void {
    this.activeSlide = index;
  }

  getStars(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('full');
      } else if (rating >= i - 0.5) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }
}
