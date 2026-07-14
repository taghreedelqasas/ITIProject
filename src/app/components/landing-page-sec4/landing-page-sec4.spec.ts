import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageSec4 } from './landing-page-sec4';

describe('LandingPageSec4', () => {
  let component: LandingPageSec4;
  let fixture: ComponentFixture<LandingPageSec4>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageSec4],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageSec4);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
