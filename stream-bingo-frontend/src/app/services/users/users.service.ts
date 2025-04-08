import { Injectable } from '@angular/core'
import { io, Socket } from 'socket.io-client'
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

  public searchByName(name: string) {
    this.sendMessage('searchByName', {name})
  }
}
