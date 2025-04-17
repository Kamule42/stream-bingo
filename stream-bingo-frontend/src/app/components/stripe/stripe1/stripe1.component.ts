import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stipe1',
  imports: [],
  templateUrl: './stripe1.component.html',
  styleUrl: './stripe1.component.scss'
})
export class Stripe1Component {
  readonly color = input<string>('#14a723')
}
