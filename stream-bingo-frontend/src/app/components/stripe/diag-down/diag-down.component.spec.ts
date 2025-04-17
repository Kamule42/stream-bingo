import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagDownComponent } from './diag-down.component';

describe('DiagDownComponent', () => {
  let component: DiagDownComponent;
  let fixture: ComponentFixture<DiagDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagDownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
