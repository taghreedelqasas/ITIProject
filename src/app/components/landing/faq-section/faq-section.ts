import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FaqItem {
  question: string;
  answer?: string;
  open: boolean;
}

@Component({
  selector: 'app-faq-section',
  imports: [CommonModule],
  templateUrl: './faq-section.html',
  styleUrl: './faq-section.css'
})
export class FaqSection {
  faqs = signal<FaqItem[]>([
    { question: 'هل بيانات السجل الطبي آمنة؟',
      answer:'نعم، يتم حماية جميع بيانات السجل الطبي باستخدام أحدث تقنيات التشفير، ولا يمكن الوصول إليها إلا من قبل الأشخاص المصرح لهم، لضمان خصوصيتك وأمان معلوماتك.',
       open: true },
  
    { question: 'كيف أسجل كطبيب على المنصة؟',
      answer:'أنشئ حسابًا، وأدخل بياناتك الطبية، ثم أرفق المستندات المطلوبة. بعد مراجعة طلبك والموافقة عليه، سيتم تفعيل حسابك لتبدأ باستقبال المرضى.',
       open: true },
    {
      question: 'كيف يعمل المساعد الطبي الذكي؟',
      answer: 'يقوم المساعد الذكي بتحليل الأعراض التي يصفها المريض باستخدام نماذج الذكاء الاصطناعي المتقدمة، ثم يقترح التخصصات الطبية المناسبة ويرشح الأطباء الأكثر ملاءمة بناءً على تخصصاتهم وتقييماتهم.',
      open: true
    },
    { question: 'ما هي طرق الدفع المتاحة؟',
      answer:'يمكنك الدفع إلكترونيًا بسهولة وأمان باستخدام وسائل الدفع المتاحة على المنصة أثناء حجز الموعد.',
       open: true },
    { question: 'هل يمكنني إلغاء أو تأجيل الموعد؟',
      answer:'نعم، يمكنك إلغاء أو تأجيل موعدك بسهولة من خلال حسابك في أي وقت قبل موعد الزيارة.',
       open: true }
  ]);

  toggle(index: number) {
    this.faqs.update(items =>
      items.map((item, i) => i === index ? { ...item, open: !item.open } : item)
    );
  }
}
