import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarPatient } from './navbar-patient';
import { provideRouter } from '@angular/router';

describe('NavbarPatient', () => {
  let component: NavbarPatient;
  let fixture: ComponentFixture<NavbarPatient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarPatient],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarPatient);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
