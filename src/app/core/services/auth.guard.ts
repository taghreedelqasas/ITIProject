import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // تأكدي من صحة هذا المسار في مشروعكِ

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. التحقق أولاً: هل المستخدم مسجل دخول؟
  if (!authService.isLoggedIn()) {
    // إذا لم يكن مسجلاً، نوجهه لصفحة الـ Login مع حفظ الصفحة التي كان يريدها
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // 2. التحقق ثانياً: هل المسار يتطلب صلاحية (Role) معينة؟
  const expectedRoles = route.data?.['roles'] as Array<string>;

  // لو المسار محمي بـ Role معينة (مثل Doctor أو Patient)
  if (expectedRoles && expectedRoles.length > 0) {
    const userRoles = authService.getUserRoles(); // جلب صلاحيات المستخدم الحالي

    // التحقق هل المستخدم يمتلك الصلاحية المطلوبة للدخول أم لا
    const hasRole = userRoles.some(role => expectedRoles.includes(role));

    if (!hasRole) {
      // إذا كان مسجلاً للدخول ولكنه مريض يحاول دخول لوحة تحكم الطبيب مثلاً:
      console.warn('غير مصرح لك بالدخول لهذه الصفحة!');
      router.navigate(['/']); // طرده وتوجيهه للصفحة الرئيسية
      return false;
    }
  }

  // إذا اجتاز كل الفحوصات، نسمح له بالدخول
  return true;
};