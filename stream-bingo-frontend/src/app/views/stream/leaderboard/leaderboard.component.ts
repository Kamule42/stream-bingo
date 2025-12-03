import { Component, computed, effect, inject, signal, } from '@angular/core';
import { LeaderboardService } from '../../../services/leaderboard/leaderboard.service'
import { filter, map, tap } from 'rxjs'
import { StreamsService } from '../../../services/streams/streams.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { TableModule } from 'primeng/table'
import { PaginatorModule, PaginatorState } from 'primeng/paginator'
import { IPagination } from '../../../shared/models/pagination.interface'
import { SeasonPickerComponent } from '../../../shared/components/season-picker/season-picker.component'

@Component({
  selector: 'app-leaderboard',
  imports: [
    TableModule, PaginatorModule,
    SeasonPickerComponent,
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  private readonly streamService = inject(StreamsService)
  private readonly leaderboardService = inject(LeaderboardService)

  readonly streamId$ = toSignal(this.streamService.streamDetail$.pipe(
    filter((stream) => stream != null),
    map(stream => stream.id)
  ))

  private readonly _stream$ = this.streamService.streamDetail$.pipe(
    filter((stream) => stream != null),
    tap(stream => this.leaderboardService.getLeaderBoardForStream(stream.id))
  )
  private readonly stream$ = toSignal(this._stream$)

  readonly selectedSeason = signal<string | null>(null)

  private readonly _leaderboard$ = this.leaderboardService.leaderboard$
  public readonly leaderboard$ = toSignal(this._leaderboard$)

  public readonly rows$ = computed(() => {
    const leaderboard = this.leaderboard$()
    if(leaderboard == null){
      return []
    }
    const start = (leaderboard.meta.currentPage - 1) * leaderboard.meta.itemsPerPage
    return leaderboard.data.map((score, index) => ({
      ...score,
      index: index + start + 1
    }))
  })

  private readonly _leaderboardMeta$ = this.leaderboardService.leaderboardMeta$
  readonly leaderboardMeta$ = toSignal(this._leaderboardMeta$, {initialValue: undefined})
  readonly totalItems$ = computed(() => this.leaderboardMeta$()?.totalItems)
  private readonly pagination = signal<IPagination>({
    page: 0,
    limit: 20,
  })
  public readonly page = computed(() => (this.leaderboardMeta$()?.currentPage ?? 1) - 1)
  public readonly limit = computed(() => this.leaderboardMeta$()?.itemsPerPage ?? 25)
  public readonly rowsPerPageOptions = computed(() => {
    const limit = this.limit()
    return [...new Set([limit, 1, 10, 25, 50])].toSorted((a,b) => a-b)
  })

  private readonly reloadEffect = effect(() => {
    const selectedSeason = this.selectedSeason()
    const streamId = this.streamId$()
    if(!streamId){
      return
    }
    this.leaderboardService.getLeaderBoardForStream(streamId, selectedSeason, this.pagination())
  })
  
  updatePagination($event: PaginatorState) {
    this.pagination.set({
      page: $event.page ?? 0,
      limit: $event.rows ?? 0
    })
  }
}
