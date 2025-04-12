import { Component, effect, inject, input } from '@angular/core'
import { IStream } from '../../services/streams/stream.interface'
import { GridService } from '../../services/grids/grid.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { ButtonModule } from 'primeng/button'
import { SessionService } from '../../services/session/session.service'

@Component({
  selector: 'app-bingo',
  imports: [ButtonModule],
  templateUrl: './bingo.component.html',
  styleUrl: './bingo.component.scss'
})
export class BingoComponent {
  private readonly gridService = inject(GridService)
  private readonly sessionService = inject(SessionService)

  public readonly stream = input.required<IStream>()
  public readonly session$ = this.sessionService.session$
  private readonly _streamEffect = effect(() => {
    if(this.session$() != null){
      this.gridService.getGridForStream(this.stream().id)
    }
  })

  readonly grid$ = toSignal(this.gridService.gridForStream$)

  public generateGrid(){
    if(this.session$() != null){
      console.log('Generate logged')
    }
    else{
      console.log('Generate anon')
    }
  }
}
