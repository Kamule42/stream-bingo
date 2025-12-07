import { Injectable, signal } from '@angular/core'
import { Observable, Subject, debounceTime, filter, fromEvent, map, merge, shareReplay, startWith, tap, throttleTime, zip, } from 'rxjs'
import { toSignal } from '@angular/core/rxjs-interop'
import { ICell, IRawSeason, IRight, ISeason, IStream, } from './stream.interface'
import { IPaginated, IPagination } from '../../shared/models/pagination.interface'
import { WebsocketService } from '../ws/websocket.service'
import { IFav } from '../users/users.interface'
import { paginationParam } from '../../shared/helpers/pagination.helper'
import { PaginatedLoadable } from '../../shared/async/paginated-loadable'
import { DateTime } from 'luxon'


interface ILoadStreamSeasonsParams {
  streamId?: string
  searchTerm?: string
  pagination?: IPagination
}

@Injectable({
  providedIn: 'root'
})
export class StreamsService extends WebsocketService {
  constructor(){
    super('/streams' )
  }

  
  private readonly _fetchDetail$$ = new Subject<string>()

  private readonly currentStreamWebhandle$ = signal<string | null>(null)

  private readonly _streams$ = fromEvent<IPaginated<IStream>>(this.socket, 'streamList').pipe(
    shareReplay(1)
  )

  public readonly streams$ = this._streams$.pipe(
    map(({ data: streams }) => streams),
    shareReplay(1),
  )
  public readonly streamMeta$ = this._streams$.pipe(
    map(({ meta }) => meta),
    shareReplay(1),
  )

  private readonly forceFavs$ = new Subject<IFav[]>()
  readonly favs$ = merge(
    fromEvent<IFav[]>(this.socket, 'myFavs'),
    this.forceFavs$,
  ).pipe(
    shareReplay(1),
  )
  private readonly _favs$ = toSignal(this.favs$)

  public readonly nextStreams$ = fromEvent<IPaginated<IStream>>(this.socket, 'nextStreams').pipe(
    map(({ data: streams }) => streams),
    shareReplay(1),
  )
  public readonly streamDetail$ = zip([
      fromEvent<IStream>(this.socket, 'streamDetail').pipe(
        filter(stream =>
          this.currentStreamWebhandle$() == null ||
          this.currentStreamWebhandle$() == stream?.urlHandle),
        ),
        this.favs$.pipe(
          startWith(null)
        )
      ]).pipe(
        map(([stream, favs]) => {
          if(!stream){
            return null
          }
          return {
            ...stream,
            isFav: favs?.find(fav => fav.streamId === stream.id) != null,
          }
        }),
        shareReplay(1)
      )

  
  public readonly isStreamLoading$: Observable<boolean> = merge(
    this.streamDetail$.pipe(map(() => false)),
    this._fetchDetail$$.pipe(map(() => true)),
  ).pipe(
    startWith(false),
    shareReplay(1),
  )

  public readonly cells$ = fromEvent<ICell[]>(this.socket, 'streamCells').pipe(
    shareReplay(1)
  )

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
    this.sendMessage('getNexts', paginationParam(pagination))
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

  
  public readonly searchResult$ = fromEvent<IStream[]>(this.socket, 'searchResult').pipe(
    shareReplay(1)
  )
  searchByName(name: string): void {
    this.sendMessage('searchByName', { name })
  }

  public readonly seasons = new PaginatedLoadable<ILoadStreamSeasonsParams, IRawSeason, ISeason>({
    socket: this.socket,
    loadEventName: 'getStreamSeasons',
    resultEventName: 'streamSeasons',
    converter: (rawSeason) => ({
      ...(rawSeason as unknown as ISeason),
      date: DateTime.fromISO(rawSeason.date).toJSDate(),
    }),
    loadOperations: (params) => params.pipe(
      throttleTime(100),
    )
  })
}
