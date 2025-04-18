import { Component, computed, effect, inject, output, signal } from '@angular/core'
import { ColorPickerModule } from 'primeng/colorpicker'
import { StrokeComponent } from '../strokes/stroke.component'
import { FormsModule } from '@angular/forms'
import { SettingsService } from '../../services/settings/settings.service'
import { CheckType } from '../../services/settings/setting.types'
import { toSignal } from '@angular/core/rxjs-interop'
import { ButtonModule } from 'primeng/button'
import { SliderModule } from 'primeng/slider'


@Component({
  selector: 'app-settings',
  imports: [
    ColorPickerModule, StrokeComponent, FormsModule, ButtonModule,
    SliderModule, 
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService)
  private readonly _check$ = toSignal(this.settingsService.check$, {initialValue: CheckType.CIRCLE})
  private readonly _color$ = toSignal(this.settingsService.checkColor$)
  
  readonly checks = Object.values(CheckType)
  readonly stroke = signal(CheckType.CIRCLE)
  readonly color = signal<string>('white')
  readonly alpha = signal<number>(255)
  readonly alphaColor = computed(() => `${this.color()}${this.alpha().toString(16).padStart(2, '0')}`)

  readonly done = output<void>()

  private _settingStrokeEffect = effect(() => {
    this.stroke.set(this._check$() ?? CheckType.CIRCLE)
  })
  private _settingColorEffect = effect(() => {
    const color = this._color$()
    this.color.set(color?.slice(0,7) ?? 'white')
    if(color != null && color?.length > 7){
      this.alpha.set(parseInt(color.slice(7), 16))
    }
  })

  public save(){
    this.settingsService.save({
      check: this.stroke(),
      checkColor: this.alphaColor(),
    })
    this.done.emit()
  }
}
