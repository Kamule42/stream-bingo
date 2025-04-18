import { inject, } from "@angular/core"
import { AuthService } from "../auth"
import { Socket } from "socket.io-client"
import { toSignal } from "@angular/core/rxjs-interop"
import { BehaviorSubject, debounceTime, delay, filter, map, mergeMap, of, Subject, tap, throttleTime } from "rxjs"

export abstract class WebsocketService {
  protected readonly authService = inject(AuthService)
  private readonly authorization = toSignal(this.authService.authorization$.pipe(
    throttleTime(20000),
    debounceTime(150)
  ))
  private readonly messageToSend$ = new Subject<{id: string, payload: unknown}>()
  private readonly reauth$ = new BehaviorSubject(false)
  private readonly onSend = this.messageToSend$.asObservable().pipe(
    filter(toSend => toSend != null),
    mergeMap(toSend => this.reauth$.pipe(
      map(() => toSend),
    ))
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
      this.reauth$.next(true)
      cb({
        token: this.authorization()
      })
    }
  }
}
