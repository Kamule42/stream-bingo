import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stipe3',
  imports: [],
  templateUrl: './stripe3.component.html',
  styleUrl: './stripe3.component.scss'
})
export class Stripe3Component {
  readonly color = input<string>('#14a723')
}
