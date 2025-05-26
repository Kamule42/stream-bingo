import { Injectable } from '@angular/core'
import { Socket, io } from 'socket.io-client'
import { fromEvent, map, merge, shareReplay, Subject,} from 'rxjs'
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

  readonly accountDeleted$ = fromEvent<boolean>(this.socket, 'accountDeleted')

  public searchByName(name: string) {
    this.sendMessage('searchByName', {name})
  }

  public delete(){
    this.sendMessage('deleteAccount')
  }

  private readonly updateUsername$$ = new Subject<string>()
  private readonly updateUsernameSubscription = this.updateUsername$$.subscribe({
    next: (username) => this.sendMessage('updateUsername', { username })
  })
  private readonly usernameUpdated$ = fromEvent<boolean>(this.socket, 'usernameUpdated')
  public readonly updateUsernameLoading$ = merge([
    this.updateUsername$$.pipe(map(() => true)),
    this.usernameUpdated$.pipe(map(() => false))
  ])
  public updateUsername(username: string){
    this.updateUsername$$.next(username)
  }
  public setActiveIcon(provider: string) {
    this.sendMessage('setActiveIcon', {
      provider
    })
  }
}
