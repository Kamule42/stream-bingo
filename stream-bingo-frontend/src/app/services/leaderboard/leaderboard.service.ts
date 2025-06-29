import { Injectable } from '@angular/core';
import { WebsocketService } from '../ws/websocket.service'
import { fromEvent, map, shareReplay } from 'rxjs'
import { IPaginated, IPagination } from '../../shared/models/pagination.interface'
import { IScore } from './score.interface'

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService extends WebsocketService{

  constructor(){
    super('/scoring' )
  }

  private readonly _leaderboard$ = fromEvent<IPaginated<IScore>>(this.socket, 'leaderBoardForStream').pipe(
    shareReplay(1)
  )

  readonly leaderboard$ = this._leaderboard$.pipe(
    shareReplay(1)
  )
  readonly leaderboardMeta$ = this._leaderboard$.pipe(
      map(({ meta }) => meta),
      shareReplay(1),
    )

  public getLeaderBoardForStream(streamId: string, pagination?: IPagination) {
    this.sendMessage('getLeaderBoardForStream', {
      ...(
        pagination ? {
          ...pagination,
          page: (pagination.page ?? 0) + 1
        } : {
          page: 1,
          limit: 25,
        }
      ),
      streamId,
    })
  }
}
