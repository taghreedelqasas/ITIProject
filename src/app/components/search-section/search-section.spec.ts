import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSection } from './search-section';

describe('SearchSection', () => {
  let component: SearchSection;
  let fixture: ComponentFixture<SearchSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchSection],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
