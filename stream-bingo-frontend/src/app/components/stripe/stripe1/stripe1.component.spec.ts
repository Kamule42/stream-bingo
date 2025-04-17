import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stripe1Component } from './stripe1.component';

describe('Stipe1Component', () => {
  let component: Stripe1Component;
  let fixture: ComponentFixture<Stripe1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stripe1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stripe1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
