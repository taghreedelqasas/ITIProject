import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedicalFile {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeInBytes: number;
  category: number;
  uploadedAtUtc: string;
  ocrStatus: number;
  ocrProcessedText: string | null;
}

export interface MedicalSummary {
  labResultCount: number;
  scanCount: number;
  prescriptionCount: number;
  medicalReportCount: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class MedicalFileService {

  private http = inject(HttpClient);

  private api = `${environment.apiBaseUrl}/api/MedicalFile`;

  getFiles(): Observable<MedicalFile[]> {
    return this.http.get<MedicalFile[]>(this.api);
  }

  getSummary(): Observable<MedicalSummary> {
    return this.http.get<MedicalSummary>(
      `${this.api}/summary`
    );
  }

  getByCategory(category: number) {
    return this.http.get<MedicalFile[]>(
      `${this.api}/category/${category}`
    );
  }
getDoctorFiles(patientId:number){

return this.http.get<MedicalFile[]>(

`${this.api}/doctor-view/${patientId}`

);

}


  getFile(id: number) {
    return this.http.get<MedicalFile>(
      `${this.api}/${id}`
    );
  }

  upload(formData: FormData): Observable<HttpEvent<any>> {

    return this.http.post<any>(
      this.api,
      formData,
      {
        observe: 'events',
        reportProgress: true
      }
    );
  }

  delete(id: number) {
    return this.http.delete(
      `${this.api}/${id}`
    );
  }
}