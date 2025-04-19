import { Component, computed, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DiagDownComponent } from './diag-down/diag-down.component';
import { DiagUpComponent } from './diag-up/diag-up.component';
import { Stripe1Component } from './stripe1/stripe1.component';
import { Stripe2Component } from './stripe2/stripe2.component';
import { Stripe3Component } from './stripe3/stripe3.component';
import { Stripe4Component } from './stripe4/stripe4.component';


@Component({
  selector: 'app-stripe',
  imports: [ NgComponentOutlet ],
  templateUrl: './stripe.component.html',
  styleUrl: './stripe.component.scss'
})
export class StripeComponent {
  readonly color = input<string>('#9a3737ff')
  readonly stripe= input.required<'diag_up' | 'diag_down' | 'row' | 'col'>()

  readonly stripeComponent$ = computed(() => {
    switch(this.stripe()){
      case 'diag_up': return DiagUpComponent
      case 'diag_down': return DiagDownComponent
    }
    return [
      Stripe1Component, Stripe2Component, Stripe3Component, Stripe4Component
    ][Math.floor(4*Math.random())]
  })
  readonly params$ = computed(() => {
    return {
      color: this.color(),
    }
  })
}
