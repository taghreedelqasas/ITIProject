// نماذج بيانات الطبيب - الـ API الحالي بيرجع كائن الطبيب بدون schema محدد بالتفصيل في OpenAPI،
// فبنعتمد على الحقول الشائعة (id, name, specialty...) وبنسيبها مرنة عشان لو فيه اختلاف بسيط
// في تسمية الحقول من الباك اند يفضل الكود شغال.

export interface Doctor {
  id: number;
  userId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  specialty?: string;
  departmentId?: number;
  departmentName?: string;
  licenseNumber?: string;
  certificate?: string;
  consultationFee?: number;
  address?: string;
  graduationDate?: string;
  imageProfile?: string;
  rating?: number;
  reviewsCount?: number;
  isApproved?: boolean;
  about?: string;
  [key: string]: unknown;
}

export interface DoctorCreateDto {
  licenseNumber: string;
  certificate: string;
  consultationFee: number;
  address: string;
  graduationDate: string;
  userId: string;
  departmentId: number;
  imageProfile?: string | null;
}

export interface DoctorUpdateDto {
  id: number;
  licenseNumber?: string | null;
  certificate?: string | null;
  consultationFee?: number | null;
  address?: string | null;
  graduationDate?: string | null;
  departmentId?: number | null;
  imageProfile?: string | null;
}

export interface DoctorSearchParams {
  search?: string;
  specialty?: string;
  departmentId?: number;
  location?: string;
  date?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}
