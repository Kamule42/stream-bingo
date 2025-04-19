import { inject, } from "@angular/core"
import { Socket } from "socket.io-client"
import { toSignal } from "@angular/core/rxjs-interop"
import { Subject, delay, filter, throttleTime, } from "rxjs"
import { AuthService } from "../auth"

export abstract class WebsocketService {
  protected readonly authService = inject(AuthService)
  private readonly authorization = toSignal(this.authService.authorization$.pipe(
    throttleTime(20000),
    delay(1000)
  ))
  private readonly messageToSend$ = new Subject<{id: string, payload: unknown}>()
  private readonly onSend = this.messageToSend$.asObservable().pipe(
    filter(toSend => toSend != null),
  )

  constructor(){
    this.onSend.subscribe({
      next: ({id, payload}) => this.socket.emit(id, payload)
    })
  }

  abstract get socket() : Socket

  protected sendMessage(id: string, payload?: unknown): void {
    this.messageToSend$.next({id, payload})
  }

  protected get auth(): ((cb: (data: object) => void) => void){
    return (cb) => {
      cb({
        token: this.authorization()
      })
    }
  }
}
