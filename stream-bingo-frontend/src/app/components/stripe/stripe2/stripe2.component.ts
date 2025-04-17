import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stipe2',
  imports: [],
  templateUrl: './stripe2.component.html',
  styleUrl: './stripe2.component.scss'
})
export class Stripe2Component {
  readonly color = input<string>('#14a723')
}
