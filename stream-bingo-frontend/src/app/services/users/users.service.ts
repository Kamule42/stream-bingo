import { Injectable } from '@angular/core'
import { io, Socket } from 'socket.io-client'
import { WebsocketService } from '../ws/websocket.service'
import { fromEvent, share } from 'rxjs'

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

  
  readonly userList$ = fromEvent<Array<{id: string, name: string}>>(this.socket, 'userList').pipe(
    share()
  )

  override get socket(): Socket {
    return this._socket
  }

  public searchByName(name: string) {
    this.sendMessage('searchByName', {name})
  }
  getFavs(): any {
    this.sendMessage('getMyFavs')
  }
}
