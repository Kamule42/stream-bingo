import { Component, effect, inject } from '@angular/core';
import { GridService } from '../../../services/grids/grid.service'
import { StreamsService } from '../../../services/streams/streams.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { map } from 'rxjs'
import { TableModule } from 'primeng/table'
import { DateTime } from 'luxon'
import { ButtonModule } from 'primeng/button'
import { ActivatedRoute, RouterLink } from '@angular/router'

@Component({
  selector: 'app-history',
  imports: [TableModule, ButtonModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  private readonly gridService = inject(GridService)
  private readonly streamService = inject(StreamsService)
  private readonly route = inject(ActivatedRoute)

   _webhandle = toSignal(this.route.paramMap.pipe(
    map(m => m.get('webhandle'))
  ))

  private readonly streamId$ = toSignal(this.streamService.streamDetail$.pipe(
    map(stream => stream?.id),
  ))
  readonly history$ = toSignal(this.gridService.gridHistory$)

  private readonly loadEffect = effect(() => {
    const streamId = this.streamId$()
    if(!streamId){
      return
    }
    this.gridService.getHistoryForStream(streamId)
  })

  dateFormat(date: string){
    if(!date){
      return 'En attente'
    }
    return DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_SHORT)
  }
}
