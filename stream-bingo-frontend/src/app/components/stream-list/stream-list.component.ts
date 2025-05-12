import { Component, OnInit, inject, input } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { CardModule } from 'primeng/card'
import { RouterLink } from '@angular/router'
import { CarouselModule } from 'primeng/carousel'
import { StreamsService } from '../../services/streams/streams.service'


@Component({
  selector: 'app-stream-list',
  imports: [CardModule, RouterLink, CarouselModule],
  templateUrl: './stream-list.component.html',
  styleUrl: './stream-list.component.scss'
})
export class StreamListComponent implements OnInit {
  private readonly streamService = inject(StreamsService)
  readonly streamType = input<'next', 'all'>

  private readonly _streams$ = this.streamService.nextStreams$
  readonly streams$ = toSignal(this._streams$, { initialValue: undefined })


  readonly responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '1100px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '800px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '690px',
      numVisible: 1,
      numScroll: 1
    },
  ]

  ngOnInit(): void {
    this.streamService.getNextStreams()
  }

}
