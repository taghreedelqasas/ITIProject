import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RegistrationDataService {
  private basicInfo: any = null;

  setBasicInfo(data: any): void {
    this.basicInfo = data;
  }

  getBasicInfo(): any {
    return this.basicInfo;
  }

  clear(): void {
    this.basicInfo = null;
  }
}