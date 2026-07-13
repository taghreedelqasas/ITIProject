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
    if (!this.accountNumber().trim()) {
     Swal.fire({
    icon: 'warning',
    title: 'تنبيه',
    text: 'من فضلكِ أدخلي رقم الحساب أو المحفظة.',
    confirmButtonText: 'حسنًا',
    confirmButtonColor: '#53098D'
  });
      return;
    }

    this.appointmentService.sendWithdrawRequest({
      amount,
      method: this.withdrawMethod(),
      accountNumber: this.accountNumber()
    }).subscribe({
      next: () => {
Swal.fire({
  icon: 'success',
  title: 'تم إرسال الطلب',
  text: `تم إرسال طلب سحب بمبلغ ${amount} ج.م بنجاح.`,
  timer: 2500,
  showConfirmButton: false
});   
   this.withdrawAmount.set(null);
        this.accountNumber.set('');
        this.appointmentService.getWallet();
      },
      error: (err) => {
        console.error('Error sending withdraw request:', err);
        alert('حصل خطأ أثناء إرسال طلب السحب، حاولي تاني.');
      }
    });
  }
}