import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DoctorAvailability,
  CreateDoctorAvailabilityDto,
  UpdateDoctorAvailabilityDto,
  ServiceResult
} from '../../core/models/doctor-availability';

@Injectable({
  providedIn: 'root'
})
export class DoctorAvailabilityService {

  private http = inject(HttpClient);

  private BASE = 'https://mawed.runasp.net';

  slots = signal<DoctorAvailability[]>([]);

  loading = signal(false);

getDoctorSlots(doctorId: number) {

  this.loading.set(true);

  this.http
    .get<DoctorAvailability[]>(
      `${this.BASE}/api/DoctorAvailability/doctor/${doctorId}`
    )
    .subscribe({

      next: res => {

        this.slots.set(res);

      },

      error: () => {

        this.slots.set([]);

      },

      complete: () => {

        this.loading.set(false);

      }

    });

}

  create(dto: CreateDoctorAvailabilityDto) {

    return this.http.post(

      `${this.BASE}/api/DoctorAvailability`,

      dto

    );

  }

  update(dto: UpdateDoctorAvailabilityDto) {

    return this.http.put(

      `${this.BASE}/api/DoctorAvailability/${dto.id}`,

      dto

    );

  }

  delete(id: number) {

    return this.http.delete(

      `${this.BASE}/api/DoctorAvailability/${id}`

    );

  }

getById(id:number){

return this.http.get<DoctorAvailability>(

`${this.BASE}/api/DoctorAvailability/${id}`

);

}

}