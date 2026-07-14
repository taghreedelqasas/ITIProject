import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocMain } from './doc-main';

describe('DocMain', () => {
  let component: DocMain;
  let fixture: ComponentFixture<DocMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocMain],
    }).compileComponents();

    fixture = TestBed.createComponent(DocMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
