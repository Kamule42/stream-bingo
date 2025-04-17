import { Component, input } from '@angular/core';

@Component({
  selector: 'app-diag-up',
  imports: [],
  templateUrl: './diag-up.component.html',
  styleUrl: './diag-up.component.scss'
})
export class DiagUpComponent {
  readonly color = input<string>('#14a723')
}
