import { Component, effect, inject, output, signal } from '@angular/core';
import { ColorPickerModule } from 'primeng/colorpicker'
import { StrokesComponent } from '../strokes/strokes.component';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings/settings.service';
import { CheckType } from '../../services/settings/setting.types';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';

const defaultColor = '#14a723'

@Component({
  selector: 'app-settings',
  imports: [ ColorPickerModule, StrokesComponent, FormsModule, ButtonModule ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService)
  private readonly _check$ = toSignal(this.settingsService.check$, {initialValue: CheckType.CIRCLE})
  private readonly _color$ = toSignal(this.settingsService.checkColor$, {initialValue: defaultColor})
  

  readonly checks = Object.values(CheckType)
  readonly stroke = signal(CheckType.CIRCLE)
  readonly color = signal<string>(defaultColor)

  readonly done = output<void>()

  private _settingStrokeEffect = effect(() => {
    this.stroke.set(this._check$() ?? CheckType.CIRCLE)
  })
  private _settingColorEffect = effect(() => {
    this.color.set(this._color$() ?? defaultColor)
  })

  public save(){
    this.settingsService.save({
      check: this.stroke(),
      checkColor: this.color(),
    })
    this.done.emit()
  }
}
