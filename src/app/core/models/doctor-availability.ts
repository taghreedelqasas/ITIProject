export interface DoctorAvailability{

    id:number;

    doctorId:number;

    startTime:string;

    endTime:string;

    isBooked:boolean;

}

export interface CreateDoctorAvailabilityDto {
  doctorId: number;
  startTime: string;
  endTime: string;
}

export interface UpdateDoctorAvailabilityDto {
  id: number;
  startTime: string;
  endTime: string;
}

export interface ServiceResult<T> {
  success: boolean;
  message: string;
  data: T;
}