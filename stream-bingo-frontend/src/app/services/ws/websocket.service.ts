import { inject, } from "@angular/core"
import { io, Socket } from "socket.io-client"
import { toSignal } from "@angular/core/rxjs-interop"
import { Subject,  distinctUntilChanged, filter, fromEvent, pairwise, } from "rxjs"
import { AuthService } from "../auth"


export abstract class WebsocketService {

  
  protected readonly authService = inject(AuthService)
  protected readonly authorization = toSignal(this.authService.authorization$.pipe(
    distinctUntilChanged(),
  ))
  private readonly messageToSend$ = new Subject<{id: string, payload: unknown}>()
  private readonly onSend = this.messageToSend$.asObservable().pipe(
    filter(toSend => toSend != null),
  )

  protected readonly socket: Socket

  constructor(socketUri: string){
    this.socket = io(socketUri, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: this.auth,
    })

    this.onSend.subscribe({
      next: ({id, payload}) => {
        this.socket.emit(id, payload)
      }
    })
    this.authService.rawAuthorization$.pipe(
      pairwise(),
      filter(([oldVal, newVal]) => (oldVal == null) !== (newVal == null)),
    ).subscribe({
      next: () => {
        this.socket.auth = {
          token : this.authorization()
        }
        this.socket.disconnect()
        this.socket.connect()
      }
    })

    fromEvent<boolean>(this.socket, 'logout')
    .subscribe({
      next: ()  => this.authService.logout()
    })
  }


  protected sendMessage(id: string, payload?: unknown): void {
    this.messageToSend$.next({id, payload})
  }

  protected get auth(): ((cb: (data: object) => void) => void){
    return (cb) => {
      const token = this.authorization()
      cb({
        token
      })
    }
  }
}
