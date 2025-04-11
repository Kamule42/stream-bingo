import { Component, input } from '@angular/core';
import { IStream } from '../../services/streams/stream.interface';

@Component({
  selector: 'app-bingo',
  imports: [],
  templateUrl: './bingo.component.html',
  styleUrl: './bingo.component.scss'
})
export class BingoComponent {
  public readonly stream = input.required<IStream>()
}
