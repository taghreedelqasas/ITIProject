import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocSlots } from './doc-slots';

describe('DocSlots', () => {
  let component: DocSlots;
  let fixture: ComponentFixture<DocSlots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocSlots],
    }).compileComponents();

    fixture = TestBed.createComponent(DocSlots);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
