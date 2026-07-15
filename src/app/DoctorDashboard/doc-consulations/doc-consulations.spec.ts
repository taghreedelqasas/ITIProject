import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocConsultations } from './doc-consulations';

describe('DocConsultations', () => {
  let component: DocConsultations;
  let fixture: ComponentFixture<DocConsultations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocConsultations],
    }).compileComponents();

    fixture = TestBed.createComponent(DocConsultations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
