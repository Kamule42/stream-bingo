import { Injectable, signal } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { filter, fromEvent, map, pairwise, startWith,  } from 'rxjs';
import { IGrid, IValidatedCell } from './grid.interface';
import { WebsocketService } from '../ws/websocket.service';

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

  public readonly gridForStream$ = fromEvent<IGrid | null>(this.socket, 'gridForStream').pipe(
    filter(grid => grid == null || grid?.streamId === this.currentStream$()),
    startWith(null),
    pairwise(),
    map(([oldGrid, newGrid]) => {
      if(oldGrid?.streamId != null){
        this.unsubscribeForStream(oldGrid?.streamId)
      }
      if(newGrid?.streamId != null){
        this.subscribeForStream(newGrid?.streamId)
      }
      return newGrid
    }),
  )
  public readonly validatedCells$ = fromEvent<{ streamId: string, cells: IValidatedCell[]} | null>(this.socket, 'validatedcells')

  public subscribeForStream(streamId: string){
    this.sendMessage('subscribeForStream', { streamId })
  }
  public unsubscribeForStream(streamId: string){
    this.sendMessage('unsubscribeForStream', { streamId })
  }

  public getGridForStream(streamId: string, bingoId?: string) {
    this.currentStream$.set(streamId)
    this.sendMessage('getGridForStream', { streamId, bingoId })
  }
  public createGrid(streamId: string) {
    this.currentStream$.set(streamId)
    this.sendMessage('createGridForStream', { streamId })
  }
  public flipCell(streamId: string, cellId: string){
    this.sendMessage('flipCell', {
      streamId, cellId
    })
  }
}
