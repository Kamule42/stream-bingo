import { inject, Injectable, } from '@angular/core'
import { AuthService } from '../auth'
import { UsersService } from '../users/users.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { tap } from 'rxjs'
import { IFav } from '../users/users.interface'

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly authService = inject(AuthService)
  private readonly userService = inject(UsersService)
  readonly favs$ = this.userService.favs$
  readonly favs = toSignal<Array<IFav>>(this.userService.favs$)

  private readonly _session$ = this.authService.session$.pipe(
    tap(session => {
      if(session){
        this.userService.getFavs()
      }
    })
  )
  public readonly session$ = toSignal(this._session$)

  
  public get isAuthenticated(): boolean{
    return this.session$() != undefined
  }

  public hasRight(r: string | Array<string>, s?:string): boolean{
    return this.session$()?.rights.some(({right, streamId}) =>  (
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
  public isStreamModerator(streamId: string): any {
    return this.isAdmin || this.hasRight('mod', streamId)
  }
  public isStreamManager(streamId: string): any {
    return this.isAdmin || this.hasRight('man', streamId)
  }
  public isStreamPlanificator(streamId: string): any {
    return this.isAdmin || this.hasRight(['plan', 'man'], streamId)
  }
  

  public flipFav(streamId: string, streamInfo: Omit<IFav, 'streamId'>) {
    this.userService.flipFav(streamId, streamInfo)
  }
}
