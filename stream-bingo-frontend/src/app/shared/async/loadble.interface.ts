import { Observable, } from "rxjs"
import { Socket } from "socket.io-client"


export interface ILoadableParams<P, R, V> {
  socket: Socket
  loadEventName: string
  resultEventName: string
  converter?: (data: R) => V

  loadOperations?: (params: Observable<P>) => Observable<P>
  resultOperations?: (result: Observable<R>) => Observable<R>
}

export interface ILoadable<P, V> {
  load(params: P): void
  get isLoading$():Observable<boolean>
  get value$(): Observable<V>
}
