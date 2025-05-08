import { Injectable, signal } from '@angular/core'
import { Subject, debounceTime, filter, fromEvent, map, merge, shareReplay, startWith, tap, } from 'rxjs'
import { Socket, io } from 'socket.io-client'
import { DateTime } from 'luxon'
import { toSignal } from '@angular/core/rxjs-interop'
import { ICell, IRight, IStream, RawStream } from './stream.interface'
import { IPaginated, IPagination } from '../../shared/models/pagination.interface'
import { WebsocketService } from '../ws/websocket.service'
import { IFav } from '../users/users.interface'


@Injectable({
  providedIn: 'root'
})
export class StreamsService extends WebsocketService {
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

  
  private readonly _fetchDetail$$ = new Subject<string>()

  private readonly currentStreamWebhandle$ = signal<string | null>(null)

  private readonly _streams$ = fromEvent<IPaginated<RawStream[]>>(this.socket, 'streamList').pipe(
    shareReplay(1)
  )

  public readonly streams$ = this._streams$.pipe(
    map(({ data: streams }) => streams.map<IStream>((stream) => ({
      ...stream,
      startAt: stream.startAt ? DateTime.fromISO(stream.startAt) : undefined,
      streamStartAt: stream.streamStartAt ? DateTime.fromISO(stream.streamStartAt) : undefined,
    }))),
    shareReplay(1),
  )
  public readonly streamMeta$ = this._streams$.pipe(
    map(({ meta }) => meta),
    shareReplay(1),
  )


  public readonly nextStreams$ = fromEvent<IPaginated<RawStream[]>>(this.socket, 'nextStreams').pipe(
    map(streams => streams.data.map((stream): IStream => ({
      ...stream,
      startAt: stream.startAt ? DateTime.fromISO(stream.startAt) : undefined,
      streamStartAt: stream.streamStartAt ? DateTime.fromISO(stream.streamStartAt) : undefined,
    })) ?? []),
    shareReplay(1),
  )
  public readonly streamDetail$ = fromEvent<IStream & { startAt: string }>(this.socket, 'streamDetail').pipe(
    filter(stream =>
      this.currentStreamWebhandle$() == null ||
      this.currentStreamWebhandle$() == stream?.urlHandle),
    map(stream => {
      if (!stream) {
        return undefined
      }
      let startAt = stream.startAt ? DateTime.fromISO(stream.startAt) : undefined
      if (!startAt?.isValid) {
        startAt = undefined
      }
      return {
        ...stream,
        startAt: startAt as DateTime | undefined,
      }
    }),
    shareReplay(1),
  )
  public readonly isStreamLoading$ = merge(
    this.streamDetail$.pipe(map(() => false)),
    this._fetchDetail$$.pipe(map(() => true)),
  ).pipe(
    startWith(false),
    shareReplay(1),
  )

  public readonly cells$ = fromEvent<ICell[]>(this.socket, 'streamCells').pipe(
    shareReplay(1)
  )

  private readonly forceFavs$ = new Subject<IFav[]>()
  readonly favs$ = merge(
    fromEvent<IFav[]>(this.socket, 'myFavs'),
    this.forceFavs$,
  ).pipe(
    shareReplay(1),
  )
  private readonly _favs$ = toSignal(this.favs$)

  public listStreams(pagination?: IPagination): void {
    this.sendMessage('getList', pagination ?
      {
        ...pagination,
        page: (pagination.page ?? 0) + 1
      } : {
        page: 1,
        limit: 25,
      })
  }
  public getNextStreams(pagination?: IPagination): void {
    this.sendMessage('getNexts', pagination ?
      {
        ...pagination,
        page: (pagination.page ?? 0) + 1
      } : {
        page: 1,
        limit: 10,
      })
  }

  private readonly _fetchDetail$ = this._fetchDetail$$.asObservable().subscribe({
    next: (webhandle) =>  this.sendMessage('getDetail', { webhandle })
  })
  public fetchDetails(webhandle: string) {
    this.currentStreamWebhandle$.set(webhandle)
    this._fetchDetail$$.next(webhandle)
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
    this.sendMessage('getStreamCells', { id })
  }
  
  private readonly getFavs$$ = new Subject<void>()
  private readonly _getFavs$ = toSignal(this.getFavs$$.asObservable().pipe(
    debounceTime(50),
    tap(() => this.sendMessage('getMyFavs'))
  ))
  public getFavs(): void {
    this.getFavs$$.next(void 0)
  }
  public flipFav(id: string, { streamName, twitchId, streamTwitchHandle }: Omit<IFav, 'streamId'>) {
    const hasFav = this._favs$()?.some(({ streamId }) => streamId === id)
    if (hasFav) {
      this.forceFavs$.next(this._favs$()?.filter(({ streamId }) => streamId !== id) ?? [])
    }
    else {
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

  
  public readonly searchResult$ = fromEvent<RawStream[]>(this.socket, 'searchResult').pipe(
    shareReplay(1)
  )
  searchByName(name: string): void {
    this.sendMessage('searchByName', { name })
  }
}
