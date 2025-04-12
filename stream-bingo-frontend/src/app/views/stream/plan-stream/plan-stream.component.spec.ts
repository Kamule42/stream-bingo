import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanStreamComponent } from './plan-stream.component';

describe('PlanStreamComponent', () => {
  let component: PlanStreamComponent;
  let fixture: ComponentFixture<PlanStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
