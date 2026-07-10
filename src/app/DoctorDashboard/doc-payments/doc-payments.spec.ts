import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocPayments } from './doc-payments';

describe('DocPayments', () => {
  let component: DocPayments;
  let fixture: ComponentFixture<DocPayments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocPayments],
    }).compileComponents();

    fixture = TestBed.createComponent(DocPayments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
