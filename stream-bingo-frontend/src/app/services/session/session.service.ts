import { inject, Injectable } from '@angular/core'
import { AuthService } from '../auth'
import { UsersService } from '../users/users.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { tap } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly authService = inject(AuthService)
  private readonly userService = inject(UsersService)

  private readonly _session$ = this.authService.session$.pipe(
    tap(session => {
      if(session){
        this.userService.getFavs()
      }
    })
  )
  public readonly session$ = toSignal(this._session$)

  
  
  public hasRight(r: string): boolean{
    return this.session$()?.rights.find(({right}) => r === right) !== undefined
  }

  public get isAdmin(): boolean{
    return this.hasRight('a')
  }
}
