import { Component, computed, inject, Input, input } from '@angular/core'
import { IStream } from '../../../services/streams/stream.interface'
import { SessionService } from '../../../services/session/session.service'
import { ButtonModule } from 'primeng/button'
import { NavigationEnd, Router, RouterModule } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'
import { filter, map, } from 'rxjs'

@Component({
  selector: 'app-stream-header',
  imports: [ ButtonModule, RouterModule ],
  templateUrl: './stream-header.component.html',
  styleUrl: './stream-header.component.scss'
})
export class StreamHeaderComponent {
  readonly stream = input.required<IStream>()

  private readonly router = inject(Router)
  private readonly sessionService = inject(SessionService)

  readonly session$ = this.sessionService.session$

  private _webhandle: string = ''
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


  flip() {
    const stream = this.stream()
    this.sessionService.flipFav(stream.id, {
      streamName: stream.name,
      streamTwitchHandle: stream.urlHandle,
      twitchId: stream.twitchId
    })
  }

}
