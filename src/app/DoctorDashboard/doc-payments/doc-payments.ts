import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment';

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
      alert('من فضلكِ أدخلي مبلغاً صحيحاً للسحب.');
      return;
    }
    if (!wallet || amount > wallet.balance) {
      alert('المبلغ المطلوب أكبر من الرصيد المتاح للسحب!');
      return;
    }
    if (!this.accountNumber().trim()) {
      alert('من فضلكِ أدخلي رقم الحساب أو المحفظة.');
      return;
    }

    this.appointmentService.sendWithdrawRequest({
      amount,
      method: this.withdrawMethod(),
      accountNumber: this.accountNumber()
    }).subscribe({
      next: () => {
        alert(`تم إرسال طلب سحب بمبلغ ${amount} ج.م بنجاح، وقيد المعالجة الآن! ✨`);
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