import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RescheduleModalComponent } from './reschedule-modal-component';
import { AppointmentService } from '../../core/services/appointment.service';
import { of } from 'rxjs';

describe('RescheduleModalComponent', () => {
  let component: RescheduleModalComponent;
  let fixture: ComponentFixture<RescheduleModalComponent>;
  let mockAppointmentService: any;

  beforeEach(async () => {
    mockAppointmentService = {
      getAvailableSlots: () => of([]),
      reschedule: () => of({}),
    };

    await TestBed.configureTestingModule({
      imports: [RescheduleModalComponent],
      providers: [
        { provide: AppointmentService, useValue: mockAppointmentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RescheduleModalComponent);
    component = fixture.componentInstance;
    component.appointment = {
      id: 1,
      doctorId: 2,
      doctorName: 'د. أحمد',
      patientFullName: 'أحمد',
      startTime: '2026-07-13T22:00:00Z',
      endTime: '2026-07-13T22:30:00Z',
      status: 'pending',
      doctorSpecialty: 'عظام',
      doctorLocation: 'المنصورة',
      doctorImage: 'doctor_photo.png',
      price: 200,
    } as any;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
