import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { fromEvent, map, shareReplay } from 'rxjs';
import { DateTime } from 'luxon';
import { IEditRound, IRound, RoundStatus } from './round.interface';
import { WebsocketService } from '../ws/websocket.service';

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

  readonly currentRound$ = fromEvent<RawRound>(this.socket, 'roundDetail').pipe(
    map(this.toRound),
    shareReplay(1),
  )

  readonly streamNexRouds$ = fromEvent<RawRound[]>(this.socket, 'streamRounds').pipe(
    map(rounds => rounds.map(this.toRound)),
    shareReplay(1),
  )

  public fetchCurrentRoundForStream(streamId: string) {
    this.sendMessage('getCurrentRoundForStream', {streamId})
  }
  public fetchRoundsForStream(streamId: string) {
    this.sendMessage('getRoundsForStream', {streamId})
  }
  public updateStreamRounds(streamId: string, rounds: IEditRound[], toDelete?: string[]) {
    this.sendMessage('updateStreamRounds', { streamId, rounds, toDelete})
  }
  public updateCurrentRoundStatus(streamId: string, status: RoundStatus){
    this.sendMessage('updateStreamStatus', { streamId, status})
  }

  private toRound(raw: RawRound): IRound{
    return {
      ...raw,
      startAt: DateTime.fromISO(raw.startAt).toJSDate(),
      streamStartAt: DateTime.fromISO(raw.streamStartAt).toJSDate(),
    }
  }
}
