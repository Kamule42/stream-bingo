import { Component, input } from '@angular/core';

@Component({
  selector: 'app-diag-down',
  imports: [],
  templateUrl: './diag-down.component.html',
  styleUrl: './diag-down.component.scss'
})
export class DiagDownComponent {
  readonly color = input<string>('#14a723')
}
