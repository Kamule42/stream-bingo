import { Injectable } from '@angular/core'
import { fromEvent, map, share, } from 'rxjs'
import { io, Socket } from 'socket.io-client'
import { DateTime } from'luxon'
import { IPaginated, IPagination } from '../../shared/models/pagination.interface'
import { IRight, IStream } from './stream.interface'
import { WebsocketService } from '../ws/websocket.service'

@Injectable({
  providedIn: 'root'
})
export class StreamsService extends WebsocketService{
  private readonly _socket = io('/streams', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: this.auth,
  })
  override get socket(): Socket {
    return this._socket
  }

  private readonly _streams$ = fromEvent<IPaginated<Array<IStream>>>(this.socket, 'streamList').pipe(
    share()
  )
  
  public readonly streams$ = this._streams$.pipe(
    map(({data: streams}) => streams.map((stream: any) => ({
      ...stream,
      nextStreamStartsAt: stream.nextStreamStartsAt ? DateTime.fromISO(stream.nextStreamStartsAt) : null,
      nextRoundStartsAt: stream.nextStreamStartsAt ? DateTime.fromISO(stream.nextRoundStartsAt) : null,
    }))),
    share(),
  )
  public readonly streamMeta$ = this._streams$.pipe(
    map(({meta}) => meta),
    share(),
  )


  public readonly nextStreams$ = fromEvent(this.socket, 'nextStreams').pipe(
    map(streams => streams?.data.map((stream: any) => ({
      ...stream,
      nextStreamStartsAt: stream.startAt ? DateTime.fromISO(stream.startAt) : null,
    })) ?? []),
    share(),
  )
  public readonly streamDetail$ = fromEvent(this.socket, 'streamDetail').pipe(
    map(stream =>  (stream ? {
      ...stream,
      nextStreamStartsAt: stream.startAt ? DateTime.fromISO(stream.startAt) : null,
    } : null)),
    share(),
  )

  public listStreams(pagination? : IPagination): void{
    this.sendMessage('getList', pagination ? 
      {
        ...pagination,
        page: (pagination.page ?? 0) + 1
      } : {
      page: 1,
      limit: 25,
    })
  }
  public getNextStreams(pagination? : IPagination): void{
    this.sendMessage('getNexts',pagination ? 
      {
        ...pagination,
        page: (pagination.page ?? 0) + 1
      } : {
      page: 1,
      limit: 10,
    })
  }
  public fetchDetails(webhandle: string) {
    this.sendMessage('getDetail', {webhandle})
  }
  public update(stream: IStream<Omit<IRight, 'username'>>) {
    this.sendMessage('updateStream', stream)
  }
}
