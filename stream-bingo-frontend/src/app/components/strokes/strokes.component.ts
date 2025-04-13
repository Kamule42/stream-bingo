import { Component, input } from '@angular/core';
import { CheckComponent } from './check/check.component';
import { CircleComponent } from './circle/circle.component';
import { ScratchComponent } from './scratch/scratch.component';

@Component({
  selector: 'app-strokes',
  imports: [ CheckComponent, CircleComponent, ScratchComponent ],
  templateUrl: './strokes.component.html',
  styleUrl: './strokes.component.scss'
})
export class StrokesComponent {
  readonly color = input<string>('#14a723')

}
