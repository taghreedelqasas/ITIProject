import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorReviewCardComponent } from './doctor-review-card-component';

describe('DoctorReviewCardComponent', () => {
  let component: DoctorReviewCardComponent;
  let fixture: ComponentFixture<DoctorReviewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorReviewCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorReviewCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
