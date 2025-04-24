import { Component, computed, inject, } from '@angular/core';
import { LeaderboardService } from '../../../services/leaderboard/leaderboard.service'
import { filter, tap } from 'rxjs'
import { StreamsService } from '../../../services/streams/streams.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { TableModule } from 'primeng/table'

@Component({
  selector: 'app-leaderboard',
  imports: [
    TableModule,
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  private readonly streamService = inject(StreamsService)
  private readonly leaderboardService = inject(LeaderboardService)

  private readonly _stream$ = this.streamService.streamDetail$.pipe(
    filter((stream) => stream != null),
    tap(stream => this.leaderboardService.getLeaderBoardForStream(stream.id))
  )
  private readonly stream$ = toSignal(this._stream$)

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
}
