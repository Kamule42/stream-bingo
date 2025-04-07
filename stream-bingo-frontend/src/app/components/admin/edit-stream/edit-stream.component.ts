import { Component, model } from '@angular/core';
import { IStream } from '../../../services/streams/stream.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-stream',
  imports: [FormsModule],
  templateUrl: './edit-stream.component.html',
  styleUrl: './edit-stream.component.scss'
})
export class EditStreamComponent {
  readonly stream = model.required<Partial<IStream>>()
}
