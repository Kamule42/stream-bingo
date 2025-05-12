import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { map, shareReplay, switchMap, tap, timer, } from 'rxjs'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterOutlet } from '@angular/router'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { StreamsService } from '../../../services/streams/streams.service'
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
export class StreamComponent implements OnInit{
  private readonly route = inject(ActivatedRoute)
  private readonly streamService = inject(StreamsService)
  private readonly sessionService = inject(SessionService)

  readonly noWebhandle$ = signal<boolean>(false)
  
  readonly isLoading = toSignal(this.streamService.isStreamLoading$, {initialValue: false})

  private readonly _stream$$ = this.streamService.streamDetail$.pipe(
    switchMap((stream) => timer(0, 1000).pipe(
      map(() => stream)
    )),
    shareReplay(1),
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
