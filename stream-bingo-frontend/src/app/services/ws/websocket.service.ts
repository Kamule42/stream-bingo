import { inject, } from "@angular/core"
import { Socket } from "socket.io-client"
import { toSignal } from "@angular/core/rxjs-interop"
import { Subject,  distinctUntilChanged, filter, pairwise, } from "rxjs"
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

  constructor(){
    this.onSend.subscribe({
      next: ({id, payload}) => this.socket.emit(id, payload)
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
  }

  abstract get socket() : Socket

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
