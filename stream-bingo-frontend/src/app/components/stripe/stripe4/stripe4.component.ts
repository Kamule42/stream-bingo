import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stipe4',
  imports: [],
  templateUrl: './stripe4.component.html',
  styleUrl: './stripe4.component.scss'
})
export class Stripe4Component {
  readonly color = input<string>('#14a723')
}
