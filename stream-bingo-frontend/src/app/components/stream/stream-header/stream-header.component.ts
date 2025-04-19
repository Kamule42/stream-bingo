import { Component, Input, computed, inject, input } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'
import { filter, map, } from 'rxjs'
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

  private _webhandle = ''
  @Input()
  set webhandle(webhandle: string) {
    this._webhandle = webhandle
  }

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

  readonly isEditing$ = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => event.url.endsWith('edit'))
  ), {initialValue: this.router.url.endsWith('edit')})
  readonly isPlaning$ = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => event.url.endsWith('plan'))
  ), {initialValue: this.router.url.endsWith('plan')})

  readonly isViewing$ = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => event.url.split('/').length != 3)
  ), {initialValue: this.router.url.split('/').length !== 3})


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
