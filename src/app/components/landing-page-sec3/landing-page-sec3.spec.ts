import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageSec3 } from './landing-page-sec3';

describe('LandingPageSec3', () => {
  let component: LandingPageSec3;
  let fixture: ComponentFixture<LandingPageSec3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageSec3],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageSec3);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
