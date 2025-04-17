import { Component, input } from '@angular/core';

@Component({
  selector: 'app-circle',
  imports: [],
  templateUrl: './circle.component.html',
  styleUrl: './circle.component.scss'
})
export class CircleComponent {
  readonly color = input<string>('#14a723')
}
