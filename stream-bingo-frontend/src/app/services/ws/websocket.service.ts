import { inject } from "@angular/core";
import { AuthService } from "../auth";
import { Socket } from "socket.io-client";
import { toSignal } from "@angular/core/rxjs-interop";

export abstract class WebsocketService {
  private readonly authService = inject(AuthService)
  private readonly authorization = toSignal(this.authService.authorization$)

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
