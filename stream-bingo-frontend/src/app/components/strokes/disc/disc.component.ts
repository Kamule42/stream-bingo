import { Component, input } from '@angular/core';

@Component({
  selector: 'app-disc',
  imports: [],
  templateUrl: './disc.component.html',
  styleUrl: './disc.component.scss'
})
export class DiscComponent {
  readonly color = input<string>('#14a723')
}
