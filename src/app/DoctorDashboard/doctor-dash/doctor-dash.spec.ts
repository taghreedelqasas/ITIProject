import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorDash } from './doctor-dash';
import { provideRouter } from '@angular/router';

describe('DoctorDash', () => {
  let component: DoctorDash;
  let fixture: ComponentFixture<DoctorDash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDash],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorDash);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
