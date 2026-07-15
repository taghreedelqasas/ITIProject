import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NabdAi } from './nabd-ai';

describe('NabdAi', () => {
  let component: NabdAi;
  let fixture: ComponentFixture<NabdAi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NabdAi],
    }).compileComponents();

    fixture = TestBed.createComponent(NabdAi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
