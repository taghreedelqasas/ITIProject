import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-for-doctors',
  standalone: true , 
  imports: [CommonModule,RouterLink],
  templateUrl: './for-doctors.component.html',
  styleUrls: ['./for-doctors.component.css']
})
export class ForDoctorsComponent {
  badgeLabel = 'للأطباء';

  title = 'طوّر ممارستك الطبية مع منصة موعد';

  subtitle = 'انضم إلى آلاف الأطباء الذين يديرون عياداتهم ويصلون لمرضاهم بكفاءة أكبر';

  ctaLabel = 'سجل كطبيب الآن';

  features: FeatureCard[] = [
    {
      icon: 'calendar',
      title: 'استقبال مرضى جدد',
      description: 'وصول لآلاف المرضى المحتملين في منطقتك'
    },
    {
      icon: 'calendar',
      title: 'إدارة المواعيد',
      description: 'نظام حجز ذكي يساعدك على إدارة جدولك بشكل تلقائي'
    },
    {
      icon: 'calendar',
      title: 'نمو عيادتك',
      description: 'تحليلات مفصلة لأداء عيادتك وتقييمات المرضى'
    },
    {
      icon: 'calendar',
      title: 'تحديث الجدول',
      description: 'تحكم كامل في أوقات الاستقبال والإجازات'
    }
  ];

  onRegisterClick(): void {
    // اربط هذا الحدث بصفحة التسجيل أو الـ API الخاص بك
    console.log('Register as doctor clicked');
  }
}
