export interface CreateDoctorAvailabilityDto {
  doctorId: number;
  startTime: string; // ISO date-time
  endTime: string; // ISO date-time
}

export interface UpdateDoctorAvailabilityDto {
  id: number;
  startTime: string;
  endTime: string;
}

export interface DaySlotDto {
  startTime: string;
  endTime: string;
}

export interface BulkCreateDoctorAvailabilityDto {
  doctorId: number;
  days: DaySlotDto[];
}

export interface DoctorAvailability {
  id: number;
  doctorId?: number;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
  [key: string]: unknown;
}
