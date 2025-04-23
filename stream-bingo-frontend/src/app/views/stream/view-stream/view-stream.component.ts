import { Component, Input, computed, effect, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { filter, map, switchMap, tap, } from 'rxjs'
import { BingoComponent } from '../../../components/bingo/bingo.component'
import { StreamModComponent } from "../../../components/stream/stream-mod/stream-mod.component"
import { SessionService } from '../../../services/session/session.service'
import { IStream } from '../../../services/streams/stream.interface'
import { StreamsService } from '../../../services/streams/streams.service'
import { RoundsService } from '../../../services/rounds/rounds.service'


@Component({
  selector: 'app-view-stream',
  imports: [BingoComponent, StreamModComponent],
  templateUrl: './view-stream.component.html',
  styleUrl: './view-stream.component.scss'
})
export class ViewStreamComponent {
  private readonly streamService = inject(StreamsService)
  private readonly sessionService = inject(SessionService)
    private readonly roundService = inject(RoundsService)

  private readonly _webhandle = signal<string | null>(null)
  @Input()
  set webhandle(webhandle: string) {
    this._webhandle.set(webhandle)
  }
  private readonly _bingoId = signal<string | null>(null)
  @Input()
  set bingoId(bingoId: string) {
    this._bingoId.set(bingoId)
  }

  readonly displayStream = signal<boolean>(false)

  private readonly _stream$ = this.streamService.streamDetail$.pipe(
    filter((stream) => stream != null),
    switchMap(stream => this.sessionService.favs$.pipe(
      map((favs => ({
        ...stream,
        isFav: favs?.some(({streamId}) => streamId === stream.id)
      })),
    ))),
    tap(stream => this.roundService.fetchCurrentRoundForStream(stream.id))
  )
  readonly stream$ =  toSignal<IStream>(this._stream$)

  private readonly  _round$ = this.roundService.currentRound$.pipe(
      filter(round => round != null),
   )
  readonly round$ = toSignal(this._round$)

  readonly isModerator$ = computed(() => {
    const stream = this.stream$()
    if(stream == null){
      return false
    }
    return this.sessionService.isStreamModerator(stream.id)
  })

  
  readonly isGridOpen = computed(() => {
    const round = this.round$()
    return round && round.startAt <= new Date()
  })
}
