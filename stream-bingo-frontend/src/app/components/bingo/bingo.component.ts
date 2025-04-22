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
import { CheckType } from '../../services/settings/setting.types'
import { VisibilityService } from '../../services/visibility/visibility.service'
import { StripeComponent } from '../stripe/stripe.component'
import { MessageService } from 'primeng/api'

@Component({
  selector: 'app-bingo',
  imports: [ButtonModule, PopoverModule, StrokeComponent, StripeComponent],
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
    this.gridService.getGridForStream(this.stream().id , bingoId ?? undefined)
  })

  readonly grid$ = toSignal(this.gridService.gridForStream$.pipe(
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

  readonly cells$ = computed(() => {
    const grid = this.grid$()
    return grid != null ? toChunk(grid.cells
      .map(cell => ({
        ...cell,
        valide: this.validatedCells$()?.includes(cell.cellId)
      }))
      .toSorted((a, b) => a.index - b.index),
      4) : []
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
  readonly bingos$ = computed<{ type: 'row' | 'col' | 'diag_down' | 'diag_up', index?: number, class: string }[]>(() => {
    const cells = this.cells$()
    return [
      // Rows
      ...cells
        .filter(row => row.every(({ valide }) => valide === true))
        .map((row) => ({
          type: 'row',
          index: Math.floor(row[0].index / 4),
          class: `row is-${Math.floor(row[0].index / 4)}`
        })),
      // Cols
      ...[0, 1, 2, 3]
        .filter(col => cells.every(row => row[col].valide === true))
        .map((index) => ({
          type: 'col',
          index: index,
          class: `col is-${index}`
        })),
      // Diagonal Down
      ...[
        [0, 1, 2, 3].every(index => cells[index][index].valide)
      ]
        .filter(val => val)
        .map(() => ({
          type: 'diag_down',
          class: 'diag_down',
        })),
      // Diagonal Up
      ...[
        [0, 1, 2, 3].every(index => cells[3 - index][index].valide)
      ]
        .filter(val => val)
        .map(() => ({
          type: 'diag_up',
          class: 'diag_up',
        })),
    ] as { type: 'row' | 'col' | 'diag_down' | 'diag_up', index?: number, class: string }[]
  })

  readonly score$ = computed(() => this.bingos$()?.length)



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
}
