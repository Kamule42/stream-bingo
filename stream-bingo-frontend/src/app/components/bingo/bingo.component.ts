import { Component, computed, effect, inject, Input, input, signal, ViewChild } from '@angular/core'
import { IStream } from '../../services/streams/stream.interface'
import { GridService } from '../../services/grids/grid.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { ButtonModule } from 'primeng/button'
import { SessionService } from '../../services/session/session.service'
import { toChunk } from '../../shared/helpers/array.helper'
import { Popover, PopoverModule } from 'primeng/popover'
import { map, tap } from 'rxjs'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-bingo',
  imports: [ ButtonModule, PopoverModule, ],
  templateUrl: './bingo.component.html',
  styleUrl: './bingo.component.scss'
})
export class BingoComponent {
  @ViewChild('op') op!: Popover;

  private readonly gridService = inject(GridService)
  private readonly sessionService = inject(SessionService)
  private readonly route = inject(ActivatedRoute)

  private readonly bingoId = toSignal(this.route.paramMap.pipe(
    map(m => m.get('bingoId'))
  ), { initialValue: null })


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
      if(grid && session == null){
        console.log('no session')
      }
    })
  ))
  readonly cells$ = computed(() => {
    const grid = this.grid$()
    return grid != null ? toChunk(grid.cells.toSorted((a,b) => b.index - a.index), 4) : []
  })

  readonly selectedCellDescr = signal<string | null>(null)

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
