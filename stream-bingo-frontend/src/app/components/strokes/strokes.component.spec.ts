import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrokesComponent } from './strokes.component';

describe('StrokesComponent', () => {
  let component: StrokesComponent;
  let fixture: ComponentFixture<StrokesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrokesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StrokesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
