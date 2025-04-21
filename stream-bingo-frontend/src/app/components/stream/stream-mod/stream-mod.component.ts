import { Component, computed, effect, inject, input, Input, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { InputTextModule } from 'primeng/inputtext'
import { FormsModule } from '@angular/forms'
import { debounceTime, filter, map, tap } from 'rxjs'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { ButtonModule } from 'primeng/button'
import { InputGroupModule } from 'primeng/inputgroup'
import { StreamsService } from '../../../services/streams/streams.service'
import { SettingsService } from '../../../services/settings/settings.service'
import { CheckType } from '../../../services/settings/setting.types'
import { StrokeComponent } from '../../strokes/stroke.component'
import { GridService } from '../../../services/grids/grid.service'
import { RoundsService } from '../../../services/rounds/rounds.service'
import { RoundStatus } from '../../../services/rounds/round.interface'
import { SessionService } from '../../../services/session/session.service'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-stream-mod',
  imports: [ 
    FormsModule, InputTextModule, InputGroupModule,
    InputGroupAddonModule, ButtonModule, StrokeComponent
  ],
  templateUrl: './stream-mod.component.html',
  styleUrl: './stream-mod.component.scss'
})
export class StreamModComponent {
  private readonly streamService = inject(StreamsService)
  private readonly roundService = inject(RoundsService)
  private readonly gridService = inject(GridService)
  private readonly settingsService = inject(SettingsService)
  private readonly sessionService = inject(SessionService)
  private readonly route = inject(ActivatedRoute)

  public readonly streamId = input.required<string>()
  
  private readonly bingoId = toSignal(this.route.paramMap.pipe(
    map(m => m.get('bingoId'))
  ), { initialValue: null })
  
  public readonly session$ = this.sessionService.session$
  private readonly _roundEffect = effect(() => {
    const session = this.session$()
    const bingoId = this.bingoId()
    if (bingoId != null) {
      this.roundService.fetchRoundForGrid(bingoId)
    }
    else if(session != null){
      this.roundService.fetchCurrentRoundForStream(this.streamId())
    }
  })

  readonly RoundStatus = RoundStatus

  private readonly  _round$ = this.roundService.currentRound$.pipe(
    filter(round => round != null),
    tap(round => {
      this.streamService.fetchCells(round.streamId!)
    }))
  readonly round$ = toSignal(this._round$)


  readonly cells$ = toSignal(this.streamService.cells$, {initialValue: [] })
  readonly searchText$ = signal<string>('')
  private readonly debouncedSearchText$ = toSignal(
    toObservable(this.searchText$).pipe(
      debounceTime(250)
    ), { initialValue: '' }
  )
  readonly toDisplayCells$ = computed(() => {
    const cells = this.cells$()
    const validatedCells = this.validatedCells$()
    const searchText = this.debouncedSearchText$().toLowerCase()
    return cells
      .filter(
        cell => searchText?.trim().length === 0 ||
        cell.name.toLocaleLowerCase().includes(searchText) ||
        cell.description?.toLocaleLowerCase()?.includes(searchText))
      .toSorted((a,b) => a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()))
      .map(cell => ({
        ...cell,
        checked: validatedCells.includes(cell.id)
      }))
  })
  readonly validatedCells$ = signal<string[]>([])
  
  readonly stroke$ = toSignal(this.settingsService.check$.pipe(
    map(val => val ?? CheckType.CIRCLE)
  ), { initialValue: CheckType.CIRCLE})
  readonly strokeColor$ = toSignal(this.settingsService.checkColor$.pipe(
    map(val => val ?? 'green')
  ), {initialValue: 'green'})

  readonly _validatedCells$ = toSignal(this.gridService.validatedCells$.pipe(
    filter(val => val != null && val.roundId === this.round$()!.id),
    map(val => val!.cells
      .filter(({valide}) => valide === true)
      .map(cell => cell.cellId)),
    tap(cells => this.validatedCells$.set(cells)),
  ))

  public flipCell(cellId: string){
    const checkCells = this.validatedCells$()
    const contains = checkCells.includes(cellId)
    if(contains){
      this.validatedCells$.set(
        checkCells.filter(val => val != cellId)
      )
    }
    else {
      this.validatedCells$.set([...checkCells, cellId])
    }
    this.gridService.flipCell(this.round$()!.id, cellId)
  }

  updateStatus(status: RoundStatus){
    this.roundService.updateCurrentRoundStatus(this.round$()!.streamId!, status)
  }
}
