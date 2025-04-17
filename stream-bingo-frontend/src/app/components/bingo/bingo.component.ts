import { Component, computed, effect, inject, Input, input, OnInit, signal, ViewChild } from '@angular/core'
import { IStream } from '../../services/streams/stream.interface'
import { GridService } from '../../services/grids/grid.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { ButtonModule } from 'primeng/button'
import { SessionService } from '../../services/session/session.service'
import { toChunk } from '../../shared/helpers/array.helper'
import { Popover, PopoverModule } from 'primeng/popover'
import { filter, map, tap } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'
import { SettingsService } from '../../services/settings/settings.service'
import { StrokeComponent } from '../strokes/stroke.component'
import { CheckType } from '../../services/settings/setting.types'

@Component({
  selector: 'app-bingo',
  imports: [ ButtonModule, PopoverModule, StrokeComponent, ],
  templateUrl: './bingo.component.html',
  styleUrl: './bingo.component.scss'
})
export class BingoComponent {
  @ViewChild('op') op!: Popover;

  private readonly gridService = inject(GridService)
  private readonly sessionService = inject(SessionService)
  private readonly settingsService = inject(SettingsService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  private readonly bingoId = toSignal(this.route.paramMap.pipe(
    map(m => m.get('bingoId'))
  ), { initialValue: null })


  readonly stroke$ = toSignal(this.settingsService.check$.pipe(
    map(val => val ?? CheckType.CIRCLE)
  ), { initialValue: CheckType.CIRCLE})
  readonly strokeColor$ = toSignal(this.settingsService.checkColor$.pipe(
    map(val => val ?? 'green')
  ), {initialValue: 'green'})

  public readonly stream = input.required<IStream>()
  public readonly session$ = this.sessionService.session$
  private readonly _streamEffect = effect(() => {
    const session = this.session$()
    const bingoId = this.bingoId()
    if(session != null){
      this.gridService.getGridForStream(this.stream().id)
    }
    else if(bingoId != null){
      this.gridService.getGridForStream(this.stream().id, bingoId)
    }
  })

  readonly grid$ = toSignal(this.gridService.gridForStream$.pipe(
    tap(grid => {
      const session = this.session$()
      if(grid && session == null &&  this.bingoId() == null){
        this.router.navigate(['./b', grid.id], {relativeTo: this.route })
      }
    })
  ))
  readonly cells$ = computed(() => {
    const grid = this.grid$()
    return grid != null ? toChunk(grid.cells
      .map(cell => ({
        ...cell,
        valide: this.validatedCells$()?.includes(cell.cellId)
      }))
      .toSorted((a,b) => a.index - b.index),
      4) : []
  })

  readonly selectedCellDescr = signal<string | null>(null)

  readonly validatedCells$ = toSignal(this.gridService.validatedCells$.pipe(
    filter(val => val != null && val.streamId === this.stream()?.id),
    map(val => val!.cells
      .filter(({valide}) => valide === true)
      .map(cell => cell.cellId)),
  ))

  public generateGrid(){
    this.gridService.createGrid(this.stream().id)
  }
  public showDescription(event: MouseEvent, description: string){
    if (this.selectedCellDescr() == description) {
      this.op.hide();
      this.selectedCellDescr.set(null);
    }
    else{
      this.selectedCellDescr.set(description)
      this.op.show(event)
      if (this.op.container) {
        this.op.align();
      }
    }
  }
}
