import { Injectable, signal } from '@angular/core'
import { distinctUntilChanged, filter, fromEvent, map, merge, shareReplay, Subject, tap, throttleTime,  } from 'rxjs';
import { IGrid, IGridSummary, IValidatedCell } from './grid.interface';
import { WebsocketService } from '../ws/websocket.service';
import { IWsError } from '../../shared/models/ws-errors.interface'
import { toSignal } from '@angular/core/rxjs-interop'
import { IPaginated, IPagination } from '../../shared/models/pagination.interface'
import { DateTime } from 'luxon'

@Injectable({
  providedIn: 'root'
})
export class GridService extends WebsocketService{

  constructor(){
    super('/grids' )
  }

  private readonly currentStream$ = signal<string | null>(null)

  public readonly gridNotFound$ = fromEvent<IWsError | string>(this.socket, 'exception').pipe(
    filter(error => typeof error !== 'string' && error?.type === 'unkownGrid'),
    throttleTime(1500),
  )
  private readonly invalidateGrid$ = new Subject()
  public readonly gridForStream$ = merge(
      fromEvent<IGrid | null>(this.socket, 'gridForStream'),
      this.gridNotFound$.pipe(map(() => null)),
      this.invalidateGrid$.asObservable().pipe(map(() => null)),
    ).pipe(
    shareReplay(1),
  )
  public readonly validatedCells$ = fromEvent<{
    roundId: string
    cells: (Omit<IValidatedCell, 'at'>  & {at: string})[]
  } | null>(this.socket, 'validatedcells')
  .pipe(
    shareReplay(1),
    map(val => ({
      ...val,
      cells: val?.cells.map(cell => ({
        ...cell,
        at: DateTime.fromISO(cell.at)
      }))  ?? [],
    })),
  )


  private readonly _gridHistory$ = fromEvent<IPaginated<IGridSummary>>(this.socket, 'myGrids').pipe(
    shareReplay(1)
  )
  public readonly gridHistory$ = this._gridHistory$.pipe(
    map(({ data: grids }) => grids),
    shareReplay(1),
  )
  public readonly gridsMeta$ = this._gridHistory$.pipe(
    map(({ meta }) => meta),
    shareReplay(1),
  )

  public subscribeForRound(roundId: string){
    this.sendMessage('subscribeForRound', { roundId })
  }

  public unsubscribeForRound(roundId: string){
    this.sendMessage('unsubscribeForRound', { roundId })
  }

  private readonly getGridForStream$$ = new Subject<{ streamId: string, bingoId?: string }>()
  private readonly _getGridForStream$ = toSignal(this.getGridForStream$$.asObservable().pipe(
    distinctUntilChanged((prev, curr) =>
      prev.streamId === curr.streamId &&
      prev.bingoId === curr.bingoId),
    tap(() => this.invalidateGrid$.next(null)),
    tap(body => this.sendMessage('getGridForStream', body))
  ))

  public getGridForStream(streamId: string, bingoId?: string) {
    this.currentStream$.set(streamId)
    this.getGridForStream$$.next({ streamId, bingoId })
  }
  public createGrid(streamId: string) {
    this.currentStream$.set(streamId)
    this.sendMessage('createGridForStream', { streamId })
  }
  public flipCell(roundId: string, cellId: string){
    this.sendMessage('flipCell', {
      roundId, cellId
    })
  }
  public flipGridCell(gridId: string, cellIndex: number) {
    this.sendMessage('flipGridCell', {
      gridId, cellIndex
    })
  }
  private readonly getHistoryForStream$$ = new Subject<{ streamId: string, pagination?: IPagination }>()
  private readonly getHistoryForStream$ = toSignal(this.getHistoryForStream$$.asObservable().pipe(
    distinctUntilChanged((prev, curr) =>
      prev.streamId === curr.streamId &&
      prev.pagination?.page === curr.pagination?.page &&
      prev.pagination?.limit === curr.pagination?.limit
    ),
    tap(body => this.sendMessage('getMyGrids', body))
  ))
  public getHistoryForStream(streamId: string, pagination?: IPagination){
    this.getHistoryForStream$$.next({
      streamId,
      ...(pagination ? {
        ...pagination,
        page: (pagination.page ?? 0) + 1
      } : {
        page: 1,
        limit: 25,
      }),
    })
  }
}
