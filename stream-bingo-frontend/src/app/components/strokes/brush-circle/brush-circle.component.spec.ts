import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrushCircleComponent } from './brush-circle.component';

describe('BrushCircleComponent', () => {
  let component: BrushCircleComponent;
  let fixture: ComponentFixture<BrushCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrushCircleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrushCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
