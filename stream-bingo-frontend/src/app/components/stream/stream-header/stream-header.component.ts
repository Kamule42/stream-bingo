import { Component, computed, inject, input } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'
import { filter, map, merge, mergeMap, shareReplay, switchMap, tap, zip, } from 'rxjs'
import { SessionService } from '../../../services/session/session.service'
import { IStream } from '../../../services/streams/stream.interface'

@Component({
  selector: 'app-stream-header',
  imports: [ ButtonModule, RouterModule ],
  templateUrl: './stream-header.component.html',
  styleUrl: './stream-header.component.scss'
})
export class StreamHeaderComponent {
  readonly stream = input.required<IStream>()

  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly sessionService = inject(SessionService)

  readonly session$ = this.sessionService.session$

  _webhandle = toSignal(this.route.paramMap.pipe(
    map(m => m.get('webhandle'))
  ))

  readonly isManager$ = computed(() => {
    const stream = this.stream()
    if(stream == null){
      return false
    }
    return this.sessionService.isStreamManager(stream.id)
  })

  readonly isPlanificator$ = computed(() => {
    const stream = this.stream()
    if(stream == null){
      return false
    }
    return this.sessionService.isStreamPlanificator(stream.id)
  })

  private readonly datas$ = merge(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => void 0),
    ),
    this.route.url.pipe(map(() => void 0)),
  ).pipe(
    switchMap(() => zip(
      this.route.data,
      ...(this.route.children.map(child => child.data))
    )),
    map(datas => datas.flat()),
    shareReplay(1),
  )
  readonly isEditing$ = toSignal(this.datas$.pipe(
    map(datas => datas.some(data => data['name'] === 'edit'))
  ), {initialValue: false})
  readonly isPlaning$ = toSignal(this.datas$.pipe(
    map(datas => datas.some(data => data['name'] === 'plan'))
  ), {initialValue: false})

  readonly isViewing$ = toSignal(this.datas$.pipe(
    map(datas => datas.some(data => data['name'] === 'bingo'))
  ), {initialValue: false})


  flip() {
    const stream = this.stream()
    this.sessionService.flipFav(stream.id, {
      streamName: stream.name,
      streamTwitchHandle: stream.urlHandle,
      twitchId: stream.twitchId
    })
  }

  goBack(){
    this.router.navigate(['./'], { relativeTo: this.route })
  }

}
