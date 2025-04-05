import { Injectable } from '@angular/core'
import { fromEvent, map, share } from 'rxjs'
import { io } from 'socket.io-client'
import { DateTime } from'luxon'

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
      nextStreamStartsAt: DateTime.fromISO(stream.nextStreamStartsAt),
      nextRoundStartsAt: DateTime.fromISO(stream.nextRoundStartsAt),
    }))),
    share(),
  )

  public listStreams(): void{
    this.sendMessage('getList')
  }
  public getNextStreams(): void{
    this.sendMessage('getNexts')
  }

  private sendMessage(id: string, payload?: unknown): void {
    this.socket.emit(id, payload);
  }
}
