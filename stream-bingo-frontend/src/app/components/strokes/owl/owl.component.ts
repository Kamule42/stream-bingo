import { Component, input } from '@angular/core';

@Component({
  selector: 'app-owl',
  imports: [],
  templateUrl: './owl.component.html',
  styleUrl: './owl.component.scss'
})
export class OwlComponent {
  readonly color = input<string>('#14a723')
}
