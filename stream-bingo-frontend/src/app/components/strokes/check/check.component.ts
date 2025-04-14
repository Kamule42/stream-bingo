import { Component, input } from '@angular/core';

@Component({
  selector: 'app-check',
  imports: [],
  templateUrl: './check.component.html',
  styleUrl: './check.component.scss'
})
export class CheckComponent {
  readonly color = input<string>('#14a723')
  readonly size = input(150)
}
