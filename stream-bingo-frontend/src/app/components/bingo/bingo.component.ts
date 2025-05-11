import { Component, ViewChild, computed, effect, inject, input, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ButtonModule } from 'primeng/button'
import { Popover, PopoverModule } from 'primeng/popover'
import { delay, filter, map, of, pairwise, startWith, switchMap, tap } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'
import { toChunk } from '../../shared/helpers/array.helper'
import { SessionService } from '../../services/session/session.service'
import { GridService } from '../../services/grids/grid.service'
import { IStream } from '../../services/streams/stream.interface'
import { SettingsService } from '../../services/settings/settings.service'
import { StrokeComponent } from '../strokes/stroke.component'
import { BingoMode, CheckType } from '../../services/settings/setting.types'
import { VisibilityService } from '../../services/visibility/visibility.service'
import { StripeComponent } from '../stripe/stripe.component'
import { MessageService } from 'primeng/api'
import { RoundsService } from '../../services/rounds/rounds.service'
import { RoundStatus } from '../../services/rounds/round.interface'
import { IGridCell } from '../../services/grids/grid.interface'
import { DialogModule } from 'primeng/dialog'
import { StreamsService } from '../../services/streams/streams.service'

@Component({
  selector: 'app-bingo',
  imports: [
    ButtonModule, PopoverModule, StrokeComponent, StripeComponent,
    DialogModule,
  ],
  templateUrl: './bingo.component.html',
  styleUrl: './bingo.component.scss'
})
export class BingoComponent {
  @ViewChild('op') op!: Popover;

  private readonly gridService = inject(GridService)
  private readonly sessionService = inject(SessionService)
  private readonly settingsService = inject(SettingsService)
  private readonly visibilityService = inject(VisibilityService)
  private readonly messageService = inject(MessageService)
  private readonly roundService = inject(RoundsService)
  private readonly streamService = inject(StreamsService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  private readonly bingoId = toSignal(this.route.paramMap.pipe(
    map(m => m.get('bingoId'))
  ), { initialValue: null })


  readonly stroke$ = toSignal(this.settingsService.check$.pipe(
    map(val => val ?? CheckType.CIRCLE)
  ), { initialValue: CheckType.CIRCLE })
  readonly strokeColor$ = toSignal(this.settingsService.checkColor$, { initialValue: '' })
  readonly stripeColor$ = toSignal(this.settingsService.stripeColor$, { initialValue: '' })

  public readonly stream = input.required<IStream>()
  public readonly session$ = this.sessionService.session$
  private readonly _streamEffect = effect(() => {
    const session = this.session$()
    const bingoId = this.bingoId()
    if (session == null && bingoId == null) {
      return;
    }
    console.log('get grid fro stream', bingoId)
    this.gridService.getGridForStream(this.stream().id , bingoId ?? undefined)
    this.streamService.fetchCells(this.stream().id)
  })

  readonly grid$ = toSignal(this.gridService.gridForStream$.pipe(
    tap(grid => console.log(grid)),
    tap(grid => {
      if (grid &&  this.bingoId() == null) {
        this.router.navigate(['./b', grid.id], { relativeTo: this.route })
      }
    })
  ))
  readonly gridError$ = toSignal(this.gridService.gridNotFound$.pipe(
    filter(() => this.bingoId() != null),
    tap(() => this.messageService.add({
      summary: 'Grille non trouvée',
      severity: 'warn'
    })),
    tap(() => this.router.navigate(['../../'], { relativeTo: this.route }) )
  ))
  readonly bingoMode$ = toSignal(this.settingsService.bingoMode$)
  readonly isManual$ = computed(() => this.bingoMode$() === BingoMode.MANUAL)
  readonly cells$ = signal<IGridCell[][]>([])
  private readonly _cellEffect = effect(() => {
      const grid = this.grid$()
      this.cells$.set(grid != null ?
        toChunk(grid.cells
          .map(cell => ({
            ...cell,
            checked:
              this.bingoMode$() == BingoMode.AUTO_COMPLETE && this.validatedCells$()?.includes(cell.cellId) ||
              this.bingoMode$() == BingoMode.MANUAL && cell.checked
          }))
          .toSorted((a, b) => a.index - b.index),
          4) : []
      )
  })

  readonly selectedCellDescr = signal<string | null>(null)

  readonly validatedCells$ = toSignal(this.gridService.validatedCells$.pipe(
    filter(val => val != null && val.roundId === this.grid$()?.roundId),
    map(val => val!.cells
      .filter(({ valide }) => valide === true)
      .map(cell => cell.cellId)),
    // Wait for the tab to be active to trigger the update
    switchMap(cells => this.visibilityService.isVisible$.pipe(
      startWith(true),
      pairwise(),
      switchMap(([oldVisibility, newVisibility]) => {
        if (!oldVisibility && newVisibility) {
          return of(newVisibility).pipe(delay(500))
        }
        return of(newVisibility)
      }),
      filter(val => val),
      map(() => cells),
    )),
  ))
  readonly availableCells$ = toSignal(this.streamService.cells$, {initialValue: [] })
  readonly validatedCellsWithText$ = computed(() => {
    const validatedCells = this.validatedCells$()
    const availableCells = this.availableCells$()
    if(validatedCells === undefined || availableCells === undefined){
      return undefined
    }
    return validatedCells.map(id => ({
      id,
      name: availableCells.find(c => c.id === id)?.name
    }))
    .filter(c => c.name !== undefined)
  })

  readonly bingos$ = computed<{ type: 'row' | 'col' | 'diag_down' | 'diag_up', index?: number, class: string }[]>(() => {
    const cells = this.cells$()
    return [
      // Rows
      ...cells
        .filter(row => row.every(({ checked }) => checked === true))
        .map((row) => ({
          type: 'row',
          index: Math.floor(row[0].index / 4),
          class: `row is-${Math.floor(row[0].index / 4)}`
        })),
      // Cols
      ...[0, 1, 2, 3]
        .filter(col => cells.every(row => row[col].checked === true))
        .map((index) => ({
          type: 'col',
          index: index,
          class: `col is-${index}`
        })),
      // Diagonal Down
      ...[
        [0, 1, 2, 3].every(index => cells[index][index].checked)
      ]
        .filter(val => val)
        .map(() => ({
          type: 'diag_down',
          class: 'diag_down',
        })),
      // Diagonal Up
      ...[
        [0, 1, 2, 3].every(index => cells[3 - index][index].checked)
      ]
        .filter(val => val)
        .map(() => ({
          type: 'diag_up',
          class: 'diag_up',
        })),
    ] as { type: 'row' | 'col' | 'diag_down' | 'diag_up', index?: number, class: string }[]
  })

  readonly score$ = computed(() => this.bingos$()?.length)

  private readonly  _round$ = this.roundService.currentRound$.pipe(
    filter(round => round != null),
 )
  readonly round$ = toSignal(this._round$)

  readonly canCreateGrid$ = computed(() => 
    this.round$()?.status === RoundStatus.CREATED || 
    this.round$()?.status === RoundStatus.STARTED && this.session$() != null
  )
  
  readonly showResults$ = signal<boolean>(false)

  public generateGrid() {
    this.gridService.createGrid(this.stream().id)
  }
  public showDescription(event: MouseEvent, description: string) {
    if (this.selectedCellDescr() == description) {
      this.op.hide();
      this.selectedCellDescr.set(null);
    }
    else {
      this.selectedCellDescr.set(description)
      this.op.show(event)
      if (this.op.container) {
        this.op.align();
      }
    }
  }

  public flipCell(x: number, y:number){
    if(!this.isManual$()){
      return
    }
    const cells = this.cells$()
    cells[y][x].checked = !(cells[y][x].checked ?? false)
    this.cells$.set(cells)
    this.gridService.flipGridCell(this.grid$()!.id, x+y*4)
  }
}
