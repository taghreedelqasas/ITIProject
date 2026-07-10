import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocSettings } from './doc-settings';

describe('DocSettings', () => {
  let component: DocSettings;
  let fixture: ComponentFixture<DocSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(DocSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
