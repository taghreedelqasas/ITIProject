import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocProfile } from './doc-profile';

describe('DocProfile', () => {
  let component: DocProfile;
  let fixture: ComponentFixture<DocProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(DocProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
