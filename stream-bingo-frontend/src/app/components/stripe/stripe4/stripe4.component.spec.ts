import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stripe4Component } from './stripe4.component';

describe('Stipe4Component', () => {
  let component: Stripe4Component;
  let fixture: ComponentFixture<Stripe4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stripe4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stripe4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
