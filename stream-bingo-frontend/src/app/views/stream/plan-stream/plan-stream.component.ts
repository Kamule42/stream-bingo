import { Component, effect, inject, Input, signal } from '@angular/core'
import { RoundsService } from '../../../services/rounds/rounds.service'
import { IRound } from '../../../services/rounds/round.interface'
import { toSignal } from '@angular/core/rxjs-interop'
import { map, tap } from 'rxjs'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { FormsModule } from '@angular/forms'
import { InputTextModule } from 'primeng/inputtext'
import { DatePickerModule } from 'primeng/datepicker'
import { DatePipe } from '@angular/common'
import { v4 as uuid} from 'uuid'
import { Router } from '@angular/router'
import { StreamsService } from '../../../services/streams/streams.service'
import { MessageService } from 'primeng/api'

@Component({
  selector: 'app-plan-stream',
  imports: [
    TableModule, ButtonModule, CardModule, FormsModule,
    InputTextModule, DatePickerModule, DatePipe, ],
  templateUrl: './plan-stream.component.html',
  styleUrl: './plan-stream.component.scss'
})
export class PlanStreamComponent{
  private readonly roundService = inject(RoundsService)
  private readonly streamService = inject(StreamsService)
  private readonly router = inject(Router)
    private readonly messageService = inject(MessageService)

  private _webhandle: string = ''
  @Input()
  set webhandle(webhandle: string) {
    this._webhandle = webhandle
  }

  readonly streamId$ = toSignal(this.streamService.streamDetail$.pipe(
    map(stream => stream?.id)
  ))

  readonly toEdit$ = signal<Array<IRound>>([])
  readonly nextRounds$ = toSignal(this.roundService.streamNexRouds$.pipe(
    tap(nextRounds => this.toEdit$.set(nextRounds))
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

  addNewRound(){
    this.toEdit$.set([
      ...this.toEdit$(),
      { id: uuid(), name: '', startAt: new Date(), streamStartAt: new Date() }
    ])
  }

  save(){
    this.roundService.updateStreamRounds( this.streamId$()!, this.toEdit$())
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
