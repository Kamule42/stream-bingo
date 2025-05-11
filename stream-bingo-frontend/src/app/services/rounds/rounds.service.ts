import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { distinctUntilChanged, fromEvent, map, merge, shareReplay, Subject, tap } from 'rxjs';
import { DateTime } from 'luxon';
import { IEditRound, IRound, RoundStatus } from './round.interface';
import { WebsocketService } from '../ws/websocket.service';
import { toSignal } from '@angular/core/rxjs-interop'

type RawRound = Omit<IRound, 'startAt'|'streamStartAt'> & {startAt: string, streamStartAt: string}

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

  readonly currentRound$ = merge(
    fromEvent<RawRound>(this.socket, 'roundDetail').pipe(
      map(this.toRound),
    ),
    fromEvent<void>(this.socket, 'noRoundDetail')
  ).pipe(
    shareReplay(1),
  )

  readonly streamNexRouds$ = fromEvent<RawRound[]>(this.socket, 'streamRounds').pipe(
    map(rounds => rounds.map(this.toRound)),
    shareReplay(1),
  )

  private readonly fetchCurrentRoundForStream$$ = new Subject<string>()
  private readonly _fetchCurrentRoundForStream$ = toSignal(this.fetchCurrentRoundForStream$$.asObservable().pipe(
    distinctUntilChanged(),
    tap(streamId => this.sendMessage('getCurrentRoundForStream', {streamId}))
  ))
  public fetchCurrentRoundForStream(streamId: string) {
    this.fetchCurrentRoundForStream$$.next(streamId)
  }

  private readonly fetchRoundForGrid$$ = new Subject<string>()
  private readonly _fetchRoundForGrid$ = toSignal(this.fetchRoundForGrid$$.asObservable().pipe(
    distinctUntilChanged(),
    tap(gridId => this.sendMessage('getRoundForGrid', {gridId}))
  ))
  public fetchRoundForGrid(gridId: string) {
    this.fetchRoundForGrid$$.next(gridId)
  }
  public fetchRoundsForStream(streamId: string) {
    this.sendMessage('getRoundsForStream', {streamId})
  }
  public updateStreamRounds(streamId: string, rounds: IEditRound[], toDelete?: string[]) {
    this.sendMessage('updateStreamRounds', { streamId, rounds, toDelete})
  }
  public updateCurrentRoundStatus(roundId: string, streamId: string, status: RoundStatus){
    this.sendMessage('updateStreamStatus', { roundId, streamId, status})
  }

  private toRound(raw: RawRound): IRound{
    return {
      ...raw,
      startAt: DateTime.fromISO(raw.startAt).toJSDate(),
      streamStartAt: DateTime.fromISO(raw.streamStartAt).toJSDate(),
    }
  }
}
