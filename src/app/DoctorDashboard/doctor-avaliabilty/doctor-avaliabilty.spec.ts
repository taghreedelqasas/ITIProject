import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorAvaliabilty } from './doctor-avaliabilty';

describe('DoctorAvaliabilty', () => {
  let component: DoctorAvaliabilty;
  let fixture: ComponentFixture<DoctorAvaliabilty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorAvaliabilty],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorAvaliabilty);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
