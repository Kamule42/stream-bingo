import { Component, Input, computed, effect, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { BehaviorSubject, combineLatest, concat, delay, map, mergeMap, of, switchMap, tap, throttle, throttleTime,  } from 'rxjs'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { CardModule } from 'primeng/card'
import { FormsModule } from '@angular/forms'
import { InputTextModule } from 'primeng/inputtext'
import { InputNumberModule } from 'primeng/inputnumber'
import { FloatLabel } from 'primeng/floatlabel'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { MessageModule } from 'primeng/message'
import { AutoCompleteCompleteEvent, AutoCompleteModule  } from 'primeng/autocomplete'
import { v7 as uuid} from 'uuid'
import { Router } from '@angular/router'
import { MessageService } from 'primeng/api'
import { StreamsService } from '../../../services/streams/streams.service'
import { IEditRound, } from '../../../services/rounds/round.interface'
import { RoundsService } from '../../../services/rounds/rounds.service'
import { SessionService } from '../../../services/session/session.service'
import { EmojiPickerComponent } from '../../../shared/components/emoji-picker/emoji-picker.component'
import { ISeason } from '../../../services/streams/stream.interface'

@Component({
  selector: 'app-plan-stream',
  imports: [
    TableModule, ButtonModule, CardModule, FormsModule,
    InputTextModule, FloatLabel, EmojiPickerComponent,
    IconFieldModule, InputIconModule,
    InputNumberModule, AutoCompleteModule,
    ProgressSpinnerModule, MessageModule,
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
    map(stream => stream?.id),
    tap(streamId => {
      if(streamId){
        this.roundService.fetchCurrentRoundForStream(streamId)
      }
    }),
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

  readonly currentRound$ = toSignal(this.roundService.currentRound$)
  readonly toEdit$ = signal<IEditRound | null>(null)

  private readonly _handleEffect = effect(()=> {
    const streamId = this.streamId$()
    if(!streamId){
      this.toEdit$.set(null)
    }
  })
  private readonly seasonsSearch$ = new BehaviorSubject<string | null>(null)
  private readonly _findSeason = this.seasonsSearch$.subscribe({
    next: (searchTerm) => {
      this.streamService.fetchStreamSeasons(this.streamId$()!, searchTerm?.trim() ?? '')
    }
  })
  readonly newSeason$ = new BehaviorSubject<ISeason | null>(null)
  readonly seasonsFiltered$ = toSignal(combineLatest([
    this.streamService.streamSeasons$,
    this.newSeason$.asObservable()
  ]).pipe(
    map(([seasons, newSeason]) => {
      if (newSeason) {
        return [newSeason, ...seasons]
      }
      return seasons
    })
  ), {initialValue: []})

  readonly isLoading$ = toSignal(this.roundService.roundCreationLoading$)
  readonly streamCreated$ = this.roundService.roundCreated$.subscribe({
    next: () => this.router.navigate(['s', this._webhandle])
  })
  readonly roundCreationError$ = toSignal(this.roundService.roundCreationError$.pipe(
    map(({code}) => {
      switch(code){
        case 'NO_CELLS': return 'Aucune cellule active trouvée pour le stream'
        case 'NOT_ENOUGH_CELLS': return 'Pas assez de cellules actives pour la taille de la grille'
        default: return 'Une erreur est survenue lors de la création du round'
      }
    }),
    switchMap(error => concat(
      of(null),
      of(error).pipe(delay(10))
    )),
  ))

  createRound(): void{
    this.toEdit$.set({ id: uuid(), name: '', gridSize: 4, })
  }

  searchSeason(val: AutoCompleteCompleteEvent): void{
    this.seasonsSearch$.next(val.query)
  }

  createSeason(): void {
    const id = uuid()
    this.newSeason$.next({ id , name: this.seasonsSearch$.value?.trim() ?? '' })
    this.toEdit$.set({ ...this.toEdit$()!, seasonId: id })
  }

  validateRoundCreation(): void{
    const toEdit = this.toEdit$()
    if(!toEdit) {
      return
    }
    if(!toEdit.name || toEdit.name.trim().length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Le nom du round est obligatoire'})
      return
    }
    this.roundService.createRound(this.streamId$()!, toEdit, this.newSeason$.value ?? undefined)
  }

  cancel(){
    this.router.navigate(['s', this._webhandle])
  }

  addEmoji(emoji: string): void {
    const toEdit = this.toEdit$()
    if(!toEdit) {
      return
    }
    toEdit.name += emoji
    this.toEdit$.set(toEdit)
  }
}
