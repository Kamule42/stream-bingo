import { Injectable } from '@angular/core'
import { fromEvent, map, merge, share, shareReplay, Subject, } from 'rxjs'
import { io, Socket } from 'socket.io-client'
import { DateTime } from'luxon'
import { IPaginated, IPagination } from '../../shared/models/pagination.interface'
import { ICell, IRight, IStream } from './stream.interface'
import { WebsocketService } from '../ws/websocket.service'
import { IFav, ISeachResult } from '../users/users.interface'
import { toSignal } from '@angular/core/rxjs-interop'

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
  public readonly streamDetail$ = fromEvent<IStream & {startAt: string}>(this.socket, 'streamDetail').pipe(
    map(stream =>  {
      if(!stream){
        return undefined
      } 
      let startAt = stream.startAt ? DateTime.fromISO(stream.startAt) : undefined
      if(!startAt?.isValid){
        startAt = undefined
      }
      return {
        ...stream,
        startAt: startAt as DateTime | undefined,
      }   
  }),
    shareReplay(1),
  )

  public readonly cells$ = fromEvent<Array<ICell>>(this.socket, 'streamCells').pipe(
    shareReplay(1)
  )

  private readonly forceFavs$ = new Subject<Array<IFav>>()
  readonly favs$ = merge(
    fromEvent<Array<IFav>>(this.socket, 'myFavs'),
    this.forceFavs$,
  ).pipe(
    shareReplay(1),
  )
  private readonly _favs$ = toSignal(this.favs$) 

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
  public updateCells(id: string | undefined, cells: Partial<ICell>[] | undefined) {
    this.sendMessage('updateCellsFormStream', {
      id,
      cells
    })
  }
  public fetchCells(id: string) {
    this.sendMessage('getStreamCells', {id})
  }

  public getFavs(): any {
    this.sendMessage('getMyFavs')
  }
  public flipFav(id: string, {streamName, twitchId, streamTwitchHandle}: Omit<IFav, 'streamId'>) {
    const hasFav = this._favs$()?.some(({streamId}) => streamId === id)
    if(hasFav){
      this.forceFavs$.next(this._favs$()?.filter(({streamId}) => streamId !== id) ?? [])
    }
    else{
      this.forceFavs$.next([
        ...this._favs$() ?? [],
        {
          streamId: id,
          streamName,
          twitchId,
          streamTwitchHandle
        }
      ])
    }
    this.sendMessage('flipFav', { id })
  }
}
