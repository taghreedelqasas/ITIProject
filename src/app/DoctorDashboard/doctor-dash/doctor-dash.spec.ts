import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDash } from './doctor-dash';

describe('DoctorDash', () => {
  let component: DoctorDash;
  let fixture: ComponentFixture<DoctorDash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDash],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorDash);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
