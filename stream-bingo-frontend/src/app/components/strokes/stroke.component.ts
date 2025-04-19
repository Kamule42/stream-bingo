import { Component, computed, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { CheckComponent } from './check/check.component';
import { CircleComponent } from './circle/circle.component';
import { ScratchComponent } from './scratch/scratch.component';
import { DiscComponent } from './disc/disc.component';
import { CheckType } from '../../services/settings/setting.types';

@Component({
  selector: 'app-stroke',
  imports: [ NgComponentOutlet, ],
  templateUrl: './stroke.component.html',
  styleUrl: './stroke.component.scss'
})
export class StrokeComponent {
  readonly color = input<string>('#14a723')
  readonly stroke = input.required<CheckType>()

  readonly strokeComponent$ = computed(() => {
    switch( this.stroke() ){
      case CheckType.CHECK: return CheckComponent
      case CheckType.CIRCLE: return CircleComponent
      case CheckType.DISC: return DiscComponent
      case CheckType.SCRATCH: return ScratchComponent
    }
  })
  readonly params$ = computed(() => {
    return {
      color: this.color(),
    }
  })
}
