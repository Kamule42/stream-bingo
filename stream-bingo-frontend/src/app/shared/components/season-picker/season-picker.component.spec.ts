import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonPickerComponent } from './season-picker.component';

describe('SeasonPickerComponent', () => {
  let component: SeasonPickerComponent;
  let fixture: ComponentFixture<SeasonPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeasonPickerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
