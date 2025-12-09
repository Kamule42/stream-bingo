import { Injectable, inject, } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { of, shareReplay, switchMap, tap } from 'rxjs'
import { AuthService } from '../auth'
import { IFav } from '../users/users.interface'
import { StreamsService } from '../streams/streams.service'

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly authService = inject(AuthService)
  private readonly streamService = inject(StreamsService)
  readonly favs = toSignal<IFav[]>(this.streamService.favs$)

  private readonly _session$ = this.authService.session$.pipe(
    tap(session => {
      if(session){
        this.streamService.getFavs()
      }
    })
  )
  public readonly session$ = toSignal(this._session$)
  
  readonly favs$ = this._session$.pipe(
    switchMap(session => {
      if(session){
        return this.streamService.favs$
      }
      return of([])
    }),
    shareReplay(1),
  )

  
  public get isAuthenticated(): boolean{
    return this.session$() != undefined
  }

  public hasRight(r: string | string[], s?:string): boolean{
    return this.session$()?.rights?.some(({right, streamId}) =>  (
        typeof r === 'string' && r === right ||
        Array.isArray(r) && r.some(val => val === right)
      ) &&
      (
        s === undefined ||
        streamId === s
      )) ?? false
  }

  public get isAdmin(): boolean{
    return this.hasRight('a')
  }
  public isStreamModerator(streamId: string): boolean {
    return this.isAdmin || this.hasRight(['mod', 'man'], streamId)
  }
  public isStreamManager(streamId: string): boolean {
    return this.isAdmin || this.hasRight('man', streamId)
  }
  public isStreamPlanificator(streamId?: string): boolean {
    return streamId != null && (
      this.isAdmin || this.hasRight(['plan', 'man'], streamId)
    )
  }
  

  public flipFav(streamId: string, streamInfo: Omit<IFav, 'streamId'>) {
    this.streamService.flipFav(streamId, streamInfo)
  }
}
