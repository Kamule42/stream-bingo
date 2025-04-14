import { Component, input } from '@angular/core';

@Component({
  selector: 'app-scratch',
  imports: [],
  templateUrl: './scratch.component.html',
  styleUrl: './scratch.component.scss'
})
export class ScratchComponent {
  readonly color = input<string>('#14a723')
  readonly size = input(150)
}
