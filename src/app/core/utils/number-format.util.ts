// src/app/core/utils/number-format.util.ts
//
// الباك بيرجع الأرقام decimal خام (زي 124650, 240000, 87.4).
// الفورمات (240K, 2.4M, فواصل الآلاف) شغل الفرونت، مفيش داعي نضيفه في الباك.

/** 124650 -> "124,650" */
export function formatCount(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

/** 87.4 -> "87.4%" */
export function formatPercentage(value: number): string {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

/** 240000 -> "240K ج.م" ، 2400000 -> "2.4M ج.م" ، 850 -> "850 ج.م" */
export function formatCurrencyCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${trimDecimals(value / 1_000_000)}M ج.م`;
  }
  if (abs >= 1_000) {
    return `${trimDecimals(value / 1_000)}K ج.م`;
  }
  return `${formatCount(value)} ج.م`;
}

/** يشيل .0 الزيادة: 2.40 -> "2.4" ، 240.00 -> "240" */
function trimDecimals(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

/** 3050000 -> "3,050,000 ج.م" - رقم كامل بفواصل الآلاف من غير اختصار K/M (مستخدم في شاشة المدفوعات) */
export function formatCurrencyFull(value: number): string {
  return `${formatCount(value)} ج.م`;
}
