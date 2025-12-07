import { fromEvent, map, merge, Observable, shareReplay, startWith, Subject, } from "rxjs"
import { Socket } from "socket.io-client"
import { ILoadable, ILoadableParams } from "./loadble.interface"



export class Loadable<P, R, V> implements ILoadable<P, V> {
  protected readonly socket: Socket
  protected readonly loadEventName: string
  protected readonly resultEventName: string
  protected readonly converter?: (data: R) => V
  protected readonly loadOperations?: (params: Observable<P>) => Observable<P>
  protected readonly resultOperations?: (results: Observable<R>) => Observable<R>

  private readonly _load$ = new Subject<P>()
  private readonly _value$
  private readonly _isLoading$: Observable<boolean>

  constructor(params: ILoadableParams<P, R, V>) {
    this.socket = params.socket
    this.loadEventName = params.loadEventName
    this.resultEventName = params.resultEventName
    this.converter = params.converter
    this.loadOperations = params.loadOperations
    this.resultOperations = params.resultOperations

    this.setupLoad()
    this._value$ = this.setupResult()
    this._isLoading$ = this.setupIsLoading()
  }

  

  public load(params: P): void {
    this._load$.next(params)
  }
  public get value$(): Observable<V> {
    return this._value$
  }
  public get isLoading$(): Observable<boolean> {
    return this._isLoading$
  }


  private setupLoad(): void {
    (this.loadOperations ? this.loadOperations(this._load$) : this._load$)
    .subscribe({
      next: (params: P) => {
        this.socket.emit(this.loadEventName, params)
      }
    })
  }

  private setupResult(): Observable<V> {
    const obs = fromEvent<R>(this.socket, this.resultEventName).pipe(
      shareReplay(1),
    )

    return (this.resultOperations ? this.resultOperations(obs) : obs).pipe( 
      map((data: R) => {
        if(this.converter){
          return this.converter(data)
        }
        return data as unknown as V
      })
    )
  }

  private setupIsLoading(): Observable<boolean> {
    return merge(
      this._value$.pipe(map(() => false)),
      this._load$.pipe(map(() => true)),
    ).pipe(
      startWith(false),
      shareReplay(1),
    )
  }
}