export interface BookAppointmentDto {
  doctorAvailabilityId: number;
  notes?: string | null;
  patientFullName?: string | null;
  patientPhone?: string | null;
  patientGender?: string | null;
  patientAge?: number | null;
}

export interface RescheduleAppointmentDto {
  newDoctorAvailabilityId: number;
}

// الشكل الفعلي الراجع من GET /api/appointments/my و /doctor/my
export interface Appointment {
  id: number;
  status?: string; // Pending / Confirmed / Completed / Cancelled ...
  notes?: string;
  patientId?: number;
  patientName?: string;
  doctorId?: number;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorImage?: string; // لو مش موجودة من الباك إند، الكومبوننت بيستخدم صورة افتراضية
  doctorAddress?: string;
  slotStart?: string; // ISO datetime
  slotEnd?: string; // ISO datetime
  createdAt?: string;
  [key: string]: unknown;
}

export interface AvailableSlot {
  id: number; // doctorAvailabilityId
  startTime: string;
  endTime: string;
  isBooked?: boolean;
  [key: string]: unknown;
}