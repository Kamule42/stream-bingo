import { Injectable } from '@angular/core'
import { Socket, io } from 'socket.io-client'
import { fromEvent, } from 'rxjs'
import { WebsocketService } from '../ws/websocket.service'

@Injectable({
  providedIn: 'root'
})
export class AuthWsService extends WebsocketService {
  private readonly _socket = io('/auth', {
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


  private readonly refreshToken$ = fromEvent<string>(this.socket, 'refreshToken')

  constructor(){
    super()
    this.refreshToken$.subscribe({
      next: (token) => this.authService.authorization$ = token
    })
  }
}
