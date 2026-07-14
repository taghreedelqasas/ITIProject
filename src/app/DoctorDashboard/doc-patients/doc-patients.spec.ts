import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocPatients } from './doc-patients';

describe('DocPatients', () => {
  let component: DocPatients;
  let fixture: ComponentFixture<DocPatients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocPatients],
    }).compileComponents();

    fixture = TestBed.createComponent(DocPatients);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
