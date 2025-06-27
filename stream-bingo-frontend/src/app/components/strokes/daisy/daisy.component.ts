import { Component, input } from '@angular/core';

@Component({
  selector: 'app-daisy',
  imports: [],
  templateUrl: './daisy.component.html',
  styleUrl: './daisy.component.scss'
})
export class DaisyComponent {
  readonly color = input<string>('#14a723')
}
