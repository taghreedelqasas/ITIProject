import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorAvailabilityComponent } from './doctor-avaliabilty';

describe('DoctorAvailabilityComponent', () => {
  let component: DoctorAvailabilityComponent;
  let fixture: ComponentFixture<DoctorAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorAvailabilityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorAvailabilityComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
