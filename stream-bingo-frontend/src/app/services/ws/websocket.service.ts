import { inject } from "@angular/core"
import { AuthService } from "../auth"
import { Socket } from "socket.io-client"
import { toSignal } from "@angular/core/rxjs-interop"
import { tap } from "rxjs"

export abstract class WebsocketService {
  private readonly authService = inject(AuthService)
  private readonly authorization = toSignal(this.authService.authorization$.pipe(
    tap(() => {
      if(this.socket != null){
        this.socket.disconnect().connect()
      }
    }),
  ))

  abstract get socket() : Socket

  protected sendMessage(id: string, payload?: unknown): void {
    this.socket.emit(id, payload);
  }

  protected get auth(): ((cb: (data: object) => void) => void){
    return (cb) => {
      cb({
        token: this.authorization()
      })
    }
  }
}
