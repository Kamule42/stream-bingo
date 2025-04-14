import { Component, computed, input } from '@angular/core';
import { CheckComponent } from './check/check.component';
import { CircleComponent } from './circle/circle.component';
import { ScratchComponent } from './scratch/scratch.component';
import { CheckType } from '../../services/settings/setting.types';
import { NgComponentOutlet } from '@angular/common';
import { DiscComponent } from './disc/disc.component';

@Component({
  selector: 'app-strokes',
  imports: [ NgComponentOutlet, ],
  templateUrl: './strokes.component.html',
  styleUrl: './strokes.component.scss'
})
export class StrokesComponent {
  readonly color = input<string>('#14a723')
  readonly stroke = input.required<CheckType>()
  readonly size = input(150)

  readonly strokeComponent$ = computed(() => {
    switch( this.stroke() ){
      case CheckType.CHECK: return CheckComponent
      case CheckType.CIRCLE: return CircleComponent
      case CheckType.DISC: return DiscComponent
      case CheckType.SCRATCH: return ScratchComponent
    }
  })
  readonly params$ = computed(() => ({
    color: this.color(),
    size: this.size(),
  }))
}
