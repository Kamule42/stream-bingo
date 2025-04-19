import { Injectable } from '@angular/core'
import { Socket, io } from 'socket.io-client'
import { fromEvent, shareReplay,} from 'rxjs'
import { ISeachResult } from './users.interface'
import { WebsocketService } from '../ws/websocket.service'

@Injectable({
  providedIn: 'root'
})
export class UsersService extends WebsocketService {
  private readonly _socket = io('/users', {
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
  
  readonly userList$ = fromEvent<ISeachResult[]>(this.socket, 'userList').pipe(
    shareReplay(1),
  )

  public searchByName(name: string) {
    this.sendMessage('searchByName', {name})
  }
}
