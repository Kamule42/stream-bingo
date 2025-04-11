import { Component, computed, effect, inject, signal } from '@angular/core';
import { StreamsService } from '../../../services/streams/streams.service';
import { delay, flatMap, map, mergeMap, share, switchMap, take, tap, timer, withLatestFrom } from 'rxjs';
import { DateTime, Interval } from 'luxon';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SessionService } from '../../../services/session/session.service';
import { BingoComponent } from '../../../components/bingo/bingo.component';
import { IStream } from '../../../services/streams/stream.interface';

declare const Twitch: any

@Component({
  selector: 'app-stream',
  imports: [ProgressSpinnerModule, BingoComponent],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss'
})
export class StreamComponent{
  private readonly route = inject(ActivatedRoute)
  private readonly streamService = inject(StreamsService)
  private readonly sessionService = inject(SessionService)

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
    const isFav =  this.sessionService.favs$()?.some(({streamId}) => streamId === stream.id)
    return {
      ...stream,
      isFav 
    }
  })
  private readonly streamObs$ = toObservable(this.stream$)
  private embedTwitch: any = undefined
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
    this.streamService.streamDetail$.pipe(
      switchMap(stream => this.streamObs$.pipe(
        take(1),
        delay(5), // wait for the template to refresh
        map(() => stream)
      )),
    )
    .subscribe({
      next: (stream) => {
        if(!stream) return
        if(!this.embedTwitch){
          this.embedTwitch = new Twitch.Embed("twitch-embed", {
            width: 854,
            height: 480,
            channel: stream.urlHandle,
            layout: 'video',
            // Only needed if this page is going to be embedded on other websites
            parent: ["localhost"]
          })
        }
        else{
          this.embedTwitch.setChannel(stream.urlHandle)
        }
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
