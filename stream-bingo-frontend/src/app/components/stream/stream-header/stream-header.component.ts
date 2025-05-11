import { Component, computed, inject, } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'
import { SkeletonModule } from 'primeng/skeleton'
import { ButtonModule } from 'primeng/button'
import { filter, map, merge, shareReplay, switchMap, zip, } from 'rxjs'
import { SessionService } from '../../../services/session/session.service'
import { StreamsService } from '../../../services/streams/streams.service'

@Component({
  selector: 'app-stream-header',
  imports: [ ButtonModule, RouterModule, SkeletonModule ],
  templateUrl: './stream-header.component.html',
  styleUrl: './stream-header.component.scss'
})
export class StreamHeaderComponent {

  private readonly streamService = inject(StreamsService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly sessionService = inject(SessionService)

  readonly session$ = this.sessionService.session$

  readonly isLoading$ = toSignal(this.streamService.isStreamLoading$, {initialValue: false})
  readonly stream$ = toSignal(this.streamService.streamDetail$)

  _webhandle = toSignal(this.route.paramMap.pipe(
    map(m => m.get('webhandle'))
  ))

  readonly isManager$ = computed(() => {
    const stream = this.stream$()
    if(stream == null){
      return false
    }
    return this.sessionService.isStreamManager(stream.id)
  })

  readonly isPlanificator$ = computed(() => {
    const stream = this.stream$()
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

  readonly isLeaderboard$ = toSignal(this.datas$.pipe(
    map(datas => datas.some(data => data['name'] === 'leaderboard'))
  ), {initialValue: false})

  readonly isHistory$ = toSignal(this.datas$.pipe(
    map(datas => datas.some(data => data['name'] === 'history'))
  ), {initialValue: false})

  flip() {
    const stream = this.stream$()!
    this.sessionService.flipFav(stream.id, {
      streamName: stream.name,
      streamTwitchHandle: stream.urlHandle,
      twitchId: stream.twitchId
    })
  }

  goBack(){
    this.router.navigate(['./'], { relativeTo: this.route })
  }

  share(){
    const stream = this.stream$()!
    navigator.share({
      title: `Partager le bingo de ${stream.name}`,
      url: `${window.location.origin}/s/${stream.urlHandle}`
    })
  }

}
