import { Component, computed, inject, signal } from '@angular/core';
import { StreamsService } from '../../../services/streams/streams.service';
import { map, switchMap, tap, timer } from 'rxjs';
import { DateTime, Interval } from 'luxon';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SessionService } from '../../../services/session/session.service';

@Component({
  selector: 'app-stream',
  imports: [ProgressSpinnerModule],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss'
})
export class StreamComponent{
  private readonly route = inject(ActivatedRoute)
  private readonly streamService = inject(StreamsService)
  private readonly sessionService = inject(SessionService)

  private readonly _stream$ =  toSignal(this.streamService.streamDetail$.pipe(
      switchMap((stream) => timer(0, 1000).pipe(
        map(() => stream)
      )),
      map(stream =>  stream ? {
        ...stream,
        nextStreamStartsAtTxt: stream.nextStreamStartsAt >= DateTime.now() ? 
          Interval.fromDateTimes(DateTime.now(), stream.nextStreamStartsAt)
          .toDuration(['days', 'hours', 'minutes', 'seconds'])
          .toHuman({
            listStyle: 'long',
            unitDisplay: 'short',
            maximumFractionDigits: 0
          }) : null,
        nextStreamStartsAtIso: stream.nextStreamStartsAt >= DateTime.now() && stream.nextStreamStartsAt?.toISO(),
      } : null),
    ))
  readonly stream$ = computed(() => {
    const isFav =  this.sessionService.favs$()?.some(({streamId}) => streamId === this._stream$()?.id)
    return {
      ...this._stream$(),
      isFav 
    }
  })

  readonly noWebhandle$ = signal<boolean>(false)

  
  
  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(() => this.noWebhandle$.set(false)),
    )
    .subscribe({
      next: (paramMap) => {
        const webhandle = paramMap.get('webhandle')
        if(!webhandle){
          this.noWebhandle$.set(true)
          return
        }
        this.streamService.fetchDetails(webhandle)
      }
    })
  }

  flip() {
    const stream = this.stream$()!
    this.sessionService.flipFav(stream.id, {
      streamName: stream.name,
      streamTwitchHandle: stream.urlHandle,
      twitchId: stream.twitchId
    })
  }
}
