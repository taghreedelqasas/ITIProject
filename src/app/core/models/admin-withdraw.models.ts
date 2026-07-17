// src/app/core/models/admin-withdraw.models.ts
//
// مرآة لـ Maw3ed.BLL/DTOs/Wallet/WithdrawRequestAdminDto.cs
// أي تعديل في شكل الـ DTO بالباك لازم ينعكس هنا برضه.

/** طرق السحب المستخدمة فعليًا في WithdrawService (Method بيتخزن كـ string حر بالباك) */
export type WithdrawMethodValue = 'InstaPay' | 'BankTransfer' | 'Vodafone Cash' | string;

/** يقابل WithdrawRequestAdminDto.cs بالظبط - طلب سحب معلق زي ما بيرجعه GET api/admin/withdraw-requests */
export interface WithdrawRequestAdminDto {
  id: number;
  doctorName: string;
  amount: number;
  method: WithdrawMethodValue;
  accountNumber: string;
  createdAt: string;
}
