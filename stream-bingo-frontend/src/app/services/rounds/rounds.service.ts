import { Injectable } from '@angular/core';
import { WebsocketService } from '../ws/websocket.service';
import { io, Socket } from 'socket.io-client';
import { fromEvent, map, shareReplay } from 'rxjs';
import { IRound } from './round.interface';
import { DateTime } from 'luxon';

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

  readonly streamNexRouds$ = fromEvent<Array<
    Omit<IRound, 'startAt'|'streamStartAt'> & {startAt: string, streamStartAt: string}
    >>(this.socket, 'streamRounds').pipe(
    map(rounds => rounds.map(round => ({
      ...round,
      startAt: DateTime.fromISO(round.startAt).toJSDate(),
      streamStartAt: DateTime.fromISO(round.streamStartAt).toJSDate(),
    }))),
    shareReplay(1),
  )

  public fetchRoundsForStream(streamId: string) {
    this.sendMessage('getRoundsForStream', {streamId})
  }
  public updateStreamRounds(streamId: string, rounds: Array<IRound>) {
    this.sendMessage('updateStreamRounds', { streamId, rounds})
  }
}
