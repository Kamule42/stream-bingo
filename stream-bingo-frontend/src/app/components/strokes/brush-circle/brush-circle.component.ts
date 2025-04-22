import { Component, input } from '@angular/core';

@Component({
  selector: 'app-brush-circle',
  imports: [],
  templateUrl: './brush-circle.component.html',
  styleUrl: './brush-circle.component.scss'
})
export class BrushCircleComponent {
  readonly color = input<string>('#14a723')
}
