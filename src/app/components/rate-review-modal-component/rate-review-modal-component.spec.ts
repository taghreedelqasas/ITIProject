import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateReviewModalComponent } from './rate-review-modal-component';

describe('RateReviewModalComponent', () => {
  let component: RateReviewModalComponent;
  let fixture: ComponentFixture<RateReviewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateReviewModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RateReviewModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
