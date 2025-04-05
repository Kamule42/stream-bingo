import { Injectable } from '@angular/core'
import { catchError, fromEvent, map, of, share } from 'rxjs'
import { io } from 'socket.io-client'
import { DateTime } from'luxon'
import { Params } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class StreamsService {
  private readonly socket = io('/streams', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  })
  public readonly listEvent$ = fromEvent(this.socket, 'streamList').pipe(
    share(),
  )
  public readonly nextStreams$ = fromEvent(this.socket, 'nextStreams').pipe(
    map(streams => streams.map((stream: any) => ({
      ...stream,
      nextStreamStartsAt: stream.nextStreamStartsAt ? DateTime.fromISO(stream.nextStreamStartsAt) : null,
      nextRoundStartsAt: stream.nextStreamStartsAt ? DateTime.fromISO(stream.nextRoundStartsAt) : null,
    }))),
    share(),
  )
  public readonly streamDetail$ = fromEvent(this.socket, 'streamDetail').pipe(
    map(stream =>  (stream ? {
      ...stream,
      nextStreamStartsAt: stream.nextStreamStartsAt ? DateTime.fromISO(stream.nextStreamStartsAt) : null,
      nextRoundStartsAt: stream.nextStreamStartsAt ? DateTime.fromISO(stream.nextRoundStartsAt) : null,
    } : null)),
    share(),
  )

  public listStreams(): void{
    this.sendMessage('getList')
  }
  public getNextStreams(): void{
    this.sendMessage('getNexts')
  }
  public fetchDetails(webhandle: string) {
    this.sendMessage('getDetail', {webhandle})
  }

  private sendMessage(id: string, payload?: unknown): void {
    this.socket.emit(id, payload);
  }
}
