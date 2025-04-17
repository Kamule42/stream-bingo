import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrokeComponent } from './stroke.component';

describe('StrokesComponent', () => {
  let component: StrokeComponent;
  let fixture: ComponentFixture<StrokeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrokeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StrokeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
