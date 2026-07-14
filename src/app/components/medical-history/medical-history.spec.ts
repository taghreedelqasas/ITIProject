import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicalHistory } from './medical-history';
import { MedicalFileService } from '../../core/services/medicalFile.service';
import { of } from 'rxjs';

describe('MedicalHistory', () => {
  let component: MedicalHistory;
  let fixture: ComponentFixture<MedicalHistory>;
  let mockMedicalFileService: any;

  beforeEach(async () => {
    mockMedicalFileService = {
      getFiles: () => of([]),
      getSummary: () => of({}),
    };

    await TestBed.configureTestingModule({
      imports: [MedicalHistory],
      providers: [
        { provide: MedicalFileService, useValue: mockMedicalFileService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
