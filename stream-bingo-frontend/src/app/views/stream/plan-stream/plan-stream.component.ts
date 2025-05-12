import { Component, Input, computed, effect, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { map, tap } from 'rxjs'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { FormsModule } from '@angular/forms'
import { InputTextModule } from 'primeng/inputtext'
import { DatePickerModule } from 'primeng/datepicker'
import { v7 as uuid} from 'uuid'
import { Router } from '@angular/router'
import { MessageService } from 'primeng/api'
import { StreamsService } from '../../../services/streams/streams.service'
import { IEditRound, RoundStatus } from '../../../services/rounds/round.interface'
import { RoundsService } from '../../../services/rounds/rounds.service'
import { SessionService } from '../../../services/session/session.service'

@Component({
  selector: 'app-plan-stream',
  imports: [
    TableModule, ButtonModule, CardModule, FormsModule,
    InputTextModule, DatePickerModule,
],
  templateUrl: './plan-stream.component.html',
  styleUrl: './plan-stream.component.scss'
})
export class PlanStreamComponent{
  private readonly sessionService = inject(SessionService)
  private readonly roundService = inject(RoundsService)
  private readonly streamService = inject(StreamsService)
  private readonly router = inject(Router)
  private readonly messageService = inject(MessageService)

  private _webhandle = ''
  @Input()
  set webhandle(webhandle: string) {
    this._webhandle = webhandle
  }

  readonly streamId$ = toSignal(this.streamService.streamDetail$.pipe(
    map(stream => stream?.id)
  ))

  readonly isStreamPlanificator$ = computed(() => {
    const streamId = this.streamId$()
    if (streamId == null) {
      return false
    }
    return this.sessionService.isAdmin ||
      this.sessionService.isStreamPlanificator(streamId)
  })
  private readonly accessEffect = effect(() => {
    if (this.isStreamPlanificator$() === false && this.streamId$() !== undefined) {
      this.router.navigateByUrl(this.router.url.replace('/plan', ''))
    }
  })

  readonly isTimelineValid = signal<boolean>(true)
  readonly roundsToDelete = signal<string[]>([])


  readonly toEdit$ = signal<IEditRound[]>([])
  readonly rounds$ = signal<IEditRound[]>([])
  readonly nextRounds$ = toSignal(this.roundService.streamNexRouds$.pipe(
    tap(nextRounds => {
      this.toEdit$.set(nextRounds)
      this.rounds$.set(nextRounds)
    })
  ))

  private readonly _handleEffect = effect(()=> {
    const streamId = this.streamId$()
    if(streamId){
      this.roundService.fetchRoundsForStream(streamId)
    }
    else{
      this.toEdit$.set([])
    }
  })

  readonly canAddRound$ = computed(() => {
    const rounds = this.rounds$()
    if(!rounds){
      return false
    }
    return rounds.every(({status}) => status === RoundStatus.FINISHED)
  })

  addNewRound(){
    this.toEdit$.set([
      { id: uuid(), name: 'Nouveau stream', },
      ...this.toEdit$(),
    ])
  }

  save(){
    this.roundService.updateStreamRounds( this.streamId$()!, this.toEdit$())
    this.messageService.add({ severity: 'info', summary: 'Sauvegardé'})
  }
  saveTimeline(){
    this.roundService.updateStreamRounds( this.streamId$()!, this.toEdit$(), this.roundsToDelete())
    this.messageService.add({ severity: 'info', summary: 'Sauvegardé'})
  }
  cancel(){
    this.router.navigate(['s', this._webhandle])
  }

  stopNavigation($event: KeyboardEvent){
    switch($event.key){
      case 'ArrowDown':
      case 'Down':
      case 'ArrowRight':
      case 'Right':
      case 'ArrowUp':
      case 'Up':
      case 'ArrowLeft':
      case 'Left':
        $event.stopPropagation()
    }
  }

  now = new Date()
}
