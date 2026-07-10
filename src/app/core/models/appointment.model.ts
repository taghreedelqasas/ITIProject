export interface BookAppointmentDto {
  doctorAvailabilityId: number;
  notes?: string | null;
}

export interface RescheduleAppointmentDto {
  newDoctorAvailabilityId: number;
}

// شكل عام لموعد راجع من السيرفر (مرن لأن الـ OpenAPI ما بيحدد content schema للـ GET)
export interface Appointment {
  id: number;
  doctorId?: number;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorImage?: string;
  patientId?: string;
  patientName?: string;
  doctorAvailabilityId?: number;
  startTime?: string;
  endTime?: string;
  date?: string;
  time?: string;
  location?: string;
  status?: string; // Pending / Confirmed / Completed / Cancelled ...
  notes?: string;
  price?: number;
  [key: string]: unknown;
}

export interface AvailableSlot {
  id: number; // doctorAvailabilityId
  startTime: string;
  endTime: string;
  isBooked?: boolean;
  [key: string]: unknown;
}
