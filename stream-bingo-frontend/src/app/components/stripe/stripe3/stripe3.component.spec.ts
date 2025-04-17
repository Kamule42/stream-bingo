import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stripe3Component } from './stripe3.component';

describe('Stipe3Component', () => {
  let component: Stripe3Component;
  let fixture: ComponentFixture<Stripe3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stripe3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stripe3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
