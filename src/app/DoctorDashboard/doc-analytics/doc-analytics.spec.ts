import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocAnalytics } from './doc-analytics';

describe('DocAnalytics', () => {
  let component: DocAnalytics;
  let fixture: ComponentFixture<DocAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocAnalytics],
    }).compileComponents();

    fixture = TestBed.createComponent(DocAnalytics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
