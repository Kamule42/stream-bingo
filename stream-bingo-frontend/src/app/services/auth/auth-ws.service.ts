import { Injectable } from '@angular/core'
import { fromEvent, } from 'rxjs'
import { WebsocketService } from '../ws/websocket.service'

@Injectable({
  providedIn: 'root'
})
export class AuthWsService extends WebsocketService {

  private readonly refreshToken$ = fromEvent<string>(this.socket, 'refreshToken')

  constructor(){
    super('/auth')
    this.refreshToken$.subscribe({
      next: (token) => this.authService.authorization$ = token
    })
  }
}
