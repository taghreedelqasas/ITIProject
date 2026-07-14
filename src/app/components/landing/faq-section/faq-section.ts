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
    { question: 'هل بيانات السجل الطبي آمنة؟', open: false },
    { question: 'كيف يعمل تحليل الوصفات بال OCR؟', open: false },
    { question: 'كيف أسجل كطبيب على المنصة؟', open: false },
    {
      question: 'كيف يعمل المساعد الطبي الذكي؟',
      answer: 'يقوم المساعد الذكي بتحليل الأعراض التي يصفها المريض باستخدام نماذج الذكاء الاصطناعي المتقدمة، ثم يقترح التخصصات الطبية المناسبة ويرشح الأطباء الأكثر ملاءمة بناءً على تخصصاتهم وتقييماتهم.',
      open: true
    },
    { question: 'ما هي طرق الدفع المتاحة؟', open: false },
    { question: 'هل يمكنني إلغاء أو تأجيل الموعد؟', open: false }
  ]);

  toggle(index: number) {
    this.faqs.update(items =>
      items.map((item, i) => i === index ? { ...item, open: !item.open } : item)
    );
  }
}
