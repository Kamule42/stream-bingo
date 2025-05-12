import { Injectable } from '@angular/core'
import { Socket, io } from 'socket.io-client'
import { distinctUntilChanged, filter, fromEvent, map, merge, shareReplay, Subject, tap } from 'rxjs'
import { IEditRound, IRound, RoundStatus } from './round.interface'
import { WebsocketService } from '../ws/websocket.service'
import { toSignal } from '@angular/core/rxjs-interop'


@Injectable({
  providedIn: 'root'
})
export class RoundsService extends WebsocketService{
  private readonly _socket = io('/rounds', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    auth: this.auth,
    withCredentials: true,
  })
  
  override get socket(): Socket {
    return this._socket
  }

  private readonly invalidateRound = new Subject()
  readonly currentRound$ = merge(
    this.invalidateRound.asObservable().pipe(
      map(() => null),
    ),
    fromEvent<IRound>(this.socket, 'roundDetail'),
    fromEvent<void>(this.socket, 'noRoundDetail').pipe(map(() => null)),
  ).pipe(
    shareReplay(1),
  )

  readonly streamNexRouds$ = fromEvent<IRound[]>(this.socket, 'streamRounds').pipe(
    map(rounds => rounds),
    shareReplay(1),
  )

  private readonly fetchCurrentRoundForStream$$ = new Subject<string | null>()
  private readonly _fetchCurrentRoundForStream$ = toSignal(this.fetchCurrentRoundForStream$$.asObservable().pipe(
    distinctUntilChanged(),
    filter(val => val != null),
    tap(() => this.invalidateRound.next(null)),
    tap(() => this.fetchRoundForGrid$$.next(null)),
    tap(streamId => this.sendMessage('getCurrentRoundForStream', {streamId}))
  ))
  public fetchCurrentRoundForStream(streamId: string) {
    this.fetchCurrentRoundForStream$$.next(streamId)
  }

  private readonly fetchRoundForGrid$$ = new Subject<string | null>()
  private readonly _fetchRoundForGrid$ = toSignal(this.fetchRoundForGrid$$.asObservable().pipe(
    distinctUntilChanged(),
    filter(val => val != null),
    tap(() => this.fetchCurrentRoundForStream$$.next(null)),
    tap(() => this.invalidateRound.next(null)),
    tap(gridId => this.sendMessage('getRoundForGrid', {gridId}))
  ))
  public fetchRoundForGrid(gridId: string) {
    this.fetchRoundForGrid$$.next(gridId)
  }

  private readonly fetchRoundsForStream$$ = new Subject<string>()
  private readonly _fetchRoundForStream$ = toSignal(this.fetchRoundsForStream$$.asObservable().pipe(
    distinctUntilChanged(),
    tap(streamId => this.sendMessage('getRoundsForStream', {streamId})),
  ))
  public fetchRoundsForStream(streamId: string) {
    this.fetchRoundsForStream$$.next(streamId)
  }

  public updateStreamRounds(streamId: string, rounds: IEditRound[], toDelete?: string[]) {
    this.sendMessage('updateStreamRounds', { streamId, rounds, toDelete})
  }
  public updateCurrentRoundStatus(roundId: string, streamId: string, status: RoundStatus){
    this.sendMessage('updateStreamStatus', { roundId, streamId, status})
  }
}
