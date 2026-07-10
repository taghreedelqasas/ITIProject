import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocConsulations } from './doc-consulations';

describe('DocConsulations', () => {
  let component: DocConsulations;
  let fixture: ComponentFixture<DocConsulations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocConsulations],
    }).compileComponents();

    fixture = TestBed.createComponent(DocConsulations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
