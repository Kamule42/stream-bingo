import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stripe2Component } from './stripe2.component';

describe('Stipe2Component', () => {
  let component: Stripe2Component;
  let fixture: ComponentFixture<Stripe2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stripe2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stripe2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
