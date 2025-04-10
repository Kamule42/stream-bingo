import { inject, Injectable, Signal } from '@angular/core'
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
  private readonly _favs$ = toSignal<Array<IFav>>(this.userService.favs$)

  private readonly _session$ = this.authService.session$.pipe(
    tap(session => {
      if(session){
        this.userService.getFavs()
      }
    })
  )
  public readonly session$ = toSignal(this._session$)

  public get favs$(): Signal<Array<IFav> | undefined>{
    return this._favs$
  }
  
  public get isAuthenticated(): boolean{
    return this.session$() != undefined
  }

  public hasRight(r: string): boolean{
    return this.session$()?.rights.find(({right}) => r === right) !== undefined
  }

  public get isAdmin(): boolean{
    return this.hasRight('a')
  }
  public flipFav(streamId: string, streamInfo: Omit<IFav, 'streamId'>) {
    this.userService.flipFav(streamId, streamInfo)
  }
}
