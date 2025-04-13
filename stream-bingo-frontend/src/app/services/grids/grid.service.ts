import { Injectable } from '@angular/core';
import { WebsocketService } from '../ws/websocket.service';
import { io, Socket } from 'socket.io-client';
import { fromEvent } from 'rxjs';
import { IGrid } from './grid.interface';

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

  public readonly gridForStream$ = fromEvent<IGrid | null>(this.socket, 'gridForStream')

  public getGridForStream(streamId: string, bingoId?: string) {
    this.sendMessage('getGridForStream', { streamId, bingoId })
  }
  public createGrid(streamId: string) {
    this.sendMessage('createGridForStream', { streamId })
  }
}
