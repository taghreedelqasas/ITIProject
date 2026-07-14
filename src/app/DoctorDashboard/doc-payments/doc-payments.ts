import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doc-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-payments.html',
  styleUrl: './doc-payments.css'
})
export class DocPayments implements OnInit {
  protected appointmentService = inject(AppointmentService);

  withdrawAmount = signal<number | null>(null);
  withdrawMethod = signal<string>('InstaPay');
  accountNumber = signal<string>('');

  ngOnInit(): void {
    this.appointmentService.getWallet();
    this.appointmentService.getWalletTransactions();
  }

onSubmitWithdraw(): void {
    const amount = this.withdrawAmount();
    const wallet = this.appointmentService.wallet();
    const method = this.withdrawMethod();
    
    // 1. أخذ القيمة وعمل trim لضمان عدم وجود مسافات فارغة
    const account = (this.accountNumber() || '').trim();

    // 2. التحقق من المبلغ
    if (!amount || amount <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'من فضلكِ أدخلي مبلغاً صحيحاً للسحب.',
        confirmButtonColor: '#53098D'
      });
      return;
    }
    
    if (!wallet || amount > wallet.balance) {
      Swal.fire({
        icon: 'error',
        title: 'الرصيد غير كافٍ',
        text: 'المبلغ المطلوب أكبر من الرصيد المتاح.',
        confirmButtonColor: '#53098D'
      });
      return;
    }

    // 3. التحقق من وجود رقم الحساب بعد الـ trim
    if (!account) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'من فضلكِ أدخلي رقم الحساب أو المحفظة.',
        confirmButtonText: 'حسنًا',
        confirmButtonColor: '#53098D'
      });
      return;
    }

    // 4. الـ Validation الديناميكي بناءً على طريقة السحب
    if (method === 'InstaPay') {
      const instapayAddressRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
      const mobileRegex = /^01[0125][0-9]{8}$/;

      if (!instapayAddressRegex.test(account) && !mobileRegex.test(account)) {
        Swal.fire({
          icon: 'error',
          title: 'خطأ في بيانات إنستاباي',
          text: 'من فضلكِ أدخلي عنوان إنستاباي صحيح (مثال: name@instapay) أو رقم الهاتف المسجل بالخدمة (مكون من 11 رقم).',
          confirmButtonText: 'حسنًا',
          confirmButtonColor: '#53098D'
        });
        return;
      }
    }
    else if (method === 'Wallet') {
      const mobileWalletRegex = /^01[0125][0-9]{8}$/;
      if (!mobileWalletRegex.test(account)) {
        Swal.fire({
          icon: 'error',
          title: 'خطأ في الرقم',
          text: 'من فضلكِ أدخلي رقم هاتف مصري صحيح للمحفظة الإلكترونية مكون من 11 رقم (مثال: 010xxxxxxx).',
          confirmButtonText: 'حسنًا',
          confirmButtonColor: '#53098D'
        });
        return;
      }
    } 
    else if (method === 'Bank') {
      const isIban = account.toUpperCase().startsWith('EG');
      const ibanRegex = /^EG\d{2}[A-Z0-9]{4}\d{21}$/i;
      const normalBankRegex = /^\d{10,19}$/;

      if (isIban) {
        if (!ibanRegex.test(account)) {
          Swal.fire({
            icon: 'error',
            title: 'خطأ في الـ IBAN',
            text: 'صيغة الـ IBAN المصري غير صحيحة، يجب أن يبدأ بـ EG ويتكون من 29 حرفاً ورقماً.',
            confirmButtonText: 'حسنًا',
            confirmButtonColor: '#53098D'
          });
          return;
        }
      } else {
        if (!normalBankRegex.test(account)) {
          Swal.fire({
            icon: 'error',
            title: 'خطأ في الحساب البنكي',
            text: 'رقم الحساب البنكي غير صحيح! يجب أن يتكون من أرقام فقط ولا يقل عن 10 أرقام ولا يزيد عن 19 رقماً.',
            confirmButtonText: 'حسنًا',
            confirmButtonColor: '#53098D'
          });
          return;
        }
      }
    }

    // 5. إرسال الطلب (هنا بنبعت المتغير account المُنظّف والمفحوص)
    this.appointmentService.sendWithdrawRequest({
      amount,
      method: this.withdrawMethod(),
      accountNumber: account  // تعديل هام جداً لتجنب إرسال قيمة قديمة أو غير مفحوصة
    }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'تم إرسال الطلب بنجاح',
          text: 'جاري مراجعة طلب السحب الخاص بكِ وسيتم تحويل المبلغ قريباً.',
          confirmButtonColor: '#53098D'
        });
        this.withdrawAmount.set(null);
        this.accountNumber.set('');
        this.appointmentService.getWallet();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'فشل العملية',
          text: err.error?.message ?? 'حدث خطأ أثناء معالجة الطلب.',
          confirmButtonColor: '#53098D'
        });
      }
    });
  }
}