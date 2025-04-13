import { Component, signal } from '@angular/core';
import { ColorPickerModule } from 'primeng/colorpicker'
import { StrokesComponent } from '../strokes/strokes.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [ ColorPickerModule, StrokesComponent, FormsModule ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  readonly checks = ['check', 'circle', 'scratch']
  readonly color = signal<string>('#14a723')
}
