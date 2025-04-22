import { Component, input } from '@angular/core';

@Component({
  selector: 'app-scribble',
  imports: [],
  templateUrl: './scribble.component.html',
  styleUrl: './scribble.component.scss'
})
export class ScribbleComponent {
  readonly color = input<string>('#14a723')
}
