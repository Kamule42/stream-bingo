import { Component, computed, inject, signal } from '@angular/core'
import { StreamsService } from '../../../services/streams/streams.service'
import { map, share, switchMap, tap, timer, } from 'rxjs'
import { DateTime, Interval } from 'luxon'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterOutlet } from '@angular/router'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { SessionService } from '../../../services/session/session.service'
import { IStream } from '../../../services/streams/stream.interface'
import { StreamHeaderComponent } from "../../../components/stream/stream-header/stream-header.component"

@Component({
  selector: 'app-stream',
  imports: [
    ProgressSpinnerModule, StreamHeaderComponent,
    RouterOutlet,
  ],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss'
})
export class StreamComponent{
  private readonly route = inject(ActivatedRoute)
  private readonly streamService = inject(StreamsService)
  private readonly sessionService = inject(SessionService)

  readonly noWebhandle$ = signal<boolean>(false)

  private readonly _stream$$ = this.streamService.streamDetail$.pipe(
    switchMap((stream) => timer(0, 1000).pipe(
      map(() => stream)
    )),
    map(stream =>  stream ? {
      ...stream,
      startAtTxt: stream?.startAt && stream.startAt >= DateTime.now() ? 
        Interval.fromDateTimes(DateTime.now(), stream.startAt)
        .toDuration(['days', 'hours', 'minutes', 'seconds'])
        .toHuman({
          listStyle: 'long',
          unitDisplay: 'short',
          maximumFractionDigits: 0
        }) : undefined,
        startAtIso: stream?.startAt && stream.startAt >= DateTime.now() ?
          stream.startAt.toISO() ?? undefined :
          undefined,
    } : null),
    share(),
  )
  private readonly _stream$ =  toSignal(this._stream$$)
  readonly stream$ = computed<IStream | null>(() => {
    const stream = this._stream$()
    if(stream == null){
      return null
    }
    const isFav =  this.sessionService.favs()?.some(({streamId}) => streamId === stream.id)
    return {
      ...stream,
      isFav 
    }
  })
  private readonly streamObs$ = toObservable(this.stream$)  
  
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
}
