import { Component, inject, input, OnInit } from '@angular/core'
import { StreamsService } from '../../services/streams/streams.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { map, switchMap, timer } from 'rxjs'
import { DateTime, Interval } from 'luxon'
import { CardModule } from 'primeng/card'
import { RouterLink } from '@angular/router'
import { CarouselModule } from 'primeng/carousel'


@Component({
  selector: 'app-stream-list',
  imports: [CardModule, RouterLink, CarouselModule],
  templateUrl: './stream-list.component.html',
  styleUrl: './stream-list.component.scss'
})
export class StreamListComponent implements OnInit {
  private readonly streamService = inject(StreamsService)
  readonly streamType = input<'next', 'all'>

  private readonly _streams$ = this.streamService.nextStreams$.pipe(
    switchMap((streams) => timer(0, 100000).pipe(
      map(() => streams)
    )),
    map(streams => streams.map((stream: any) => ({
      ...stream,
      nextStreamStartsAtTxt: stream.nextStreamStartsAt ?
        Interval.fromDateTimes(DateTime.now(), stream.nextStreamStartsAt)
          .toDuration(['days', 'hours', 'minutes', 'seconds'])
          .toHuman({
            listStyle: 'long',
            unitDisplay: 'short',
            maximumFractionDigits: 0
          }) : null,
      nextStreamStartsAtIso: stream.nextStreamStartsAt?.toISO(),
    })))
  )
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
