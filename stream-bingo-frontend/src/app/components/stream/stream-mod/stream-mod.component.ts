import { Component, computed, inject, Input, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { InputTextModule } from 'primeng/inputtext'
import { StreamsService } from '../../../services/streams/streams.service'
import { FormsModule } from '@angular/forms'
import { debounceTime, filter, map, tap } from 'rxjs'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { ButtonModule } from 'primeng/button'
import { InputGroupModule } from 'primeng/inputgroup'
import { SettingsService } from '../../../services/settings/settings.service'
import { CheckType } from '../../../services/settings/setting.types'
import { StrokeComponent } from '../../strokes/stroke.component'
import { GridService } from '../../../services/grids/grid.service'

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
  private readonly gridService = inject(GridService)
  private readonly settingsService = inject(SettingsService)

  private readonly _streamId = signal<string>('')
  @Input()
  get streamId(): string{
    return this._streamId() ?? ''
  }
  set streamId(streamId: string){
    this._streamId.set(streamId)
    this.streamService.fetchCells(streamId)
  }
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
  readonly validatedCells$ = signal<Array<string>>([])
  
  readonly stroke$ = toSignal(this.settingsService.check$.pipe(
    map(val => val ?? CheckType.CIRCLE)
  ), { initialValue: CheckType.CIRCLE})
  readonly strokeColor$ = toSignal(this.settingsService.checkColor$.pipe(
    map(val => val ?? 'green')
  ), {initialValue: 'green'})

  readonly _validatedCells$ = toSignal(this.gridService.validatedCells$.pipe(
    filter(val => val != null && val.streamId === this._streamId()),
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
    this.gridService.flipCell(this.streamId, cellId)
  }
}
