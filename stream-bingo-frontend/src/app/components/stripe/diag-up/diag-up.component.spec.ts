import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagUpComponent } from './diag-up.component';

describe('DiagUpComponent', () => {
  let component: DiagUpComponent;
  let fixture: ComponentFixture<DiagUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
