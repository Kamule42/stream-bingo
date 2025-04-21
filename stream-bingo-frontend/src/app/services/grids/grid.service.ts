import { Injectable, signal } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { BehaviorSubject, filter, fromEvent, map, pairwise, startWith, Subject, tap, throttleTime,  } from 'rxjs';
import { IGrid, IValidatedCell } from './grid.interface';
import { WebsocketService } from '../ws/websocket.service';
import { IWsError } from '../../shared/models/ws-errors.interface'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable({
  providedIn: 'root'
})
export class GridService extends WebsocketService{
  private readonly _socket = io('/grids', {
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

  private readonly currentStream$ = signal<string | null>(null)

  public readonly gridNotFound$ = fromEvent<IWsError | string>(this.socket, 'exception').pipe(
    filter(error => typeof error !== 'string' && error?.type === 'unkownGrid'),
    throttleTime(1500),
  )
  public readonly gridForStream$ = fromEvent<IGrid | null>(this.socket, 'gridForStream').pipe(
    filter(grid => grid == null || grid?.streamId === this.currentStream$()),
    startWith(null),
    pairwise(),
    map(([oldGrid, newGrid]) => {
      if(oldGrid?.streamId != null){
        this.unsubscribeForRound(oldGrid?.roundId)
      }
      if(newGrid?.streamId != null){
        this.subscribeForRound(newGrid?.roundId)
      }
      return newGrid
    }),
  )
  public readonly validatedCells$ = fromEvent<{ roundId: string, cells: IValidatedCell[]} | null>(this.socket, 'validatedcells')

  public subscribeForRound(roundId: string){
    this.sendMessage('subscribeForRound', { roundId })
  }
  public unsubscribeForRound(roundId: string){
    this.sendMessage('unsubscribeForRound', { roundId })
  }

  private readonly getGridForStream$$ = new Subject<{ streamId: string, bingoId?: string }>()
  private readonly _getGridForStream$ = toSignal(this.getGridForStream$$.asObservable().pipe(
    throttleTime(250),
    tap(body => 
      this.sendMessage('getGridForStream', body))
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
}
