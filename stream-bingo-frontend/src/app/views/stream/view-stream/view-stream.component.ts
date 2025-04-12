import { Component, inject, OnInit } from '@angular/core'
import { BingoComponent } from '../../../components/bingo/bingo.component'
import { StreamsService } from '../../../services/streams/streams.service'
import { SessionService } from '../../../services/session/session.service'
import { delay, filter, map, zip } from 'rxjs'
import { toSignal } from '@angular/core/rxjs-interop'
import { IStream } from '../../../services/streams/stream.interface'

declare const Twitch: any

@Component({
  selector: 'app-view-stream',
  imports: [ BingoComponent ],
  templateUrl: './view-stream.component.html',
  styleUrl: './view-stream.component.scss'
})
export class ViewStreamComponent implements OnInit{
  private readonly streamService = inject(StreamsService)
  private readonly sessionService = inject(SessionService)

  private embedTwitch: any = undefined

  private readonly _stream$ = zip(
    this.streamService.streamDetail$,
    this.sessionService.favs$,
  ).pipe(
    filter(([stream]) => stream != null),
    map(([stream, favs]) => ({
      ...stream!,
      isFav: favs?.some(({streamId}) => streamId === stream!.id)
    })),
  )
  readonly stream$ =  toSignal<IStream>(this._stream$)

  ngOnInit(): void {
    this._stream$.pipe(
      delay(5),
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
}
