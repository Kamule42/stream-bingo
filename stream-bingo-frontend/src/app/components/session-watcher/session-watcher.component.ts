import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { map, of, switchMap, tap, timer } from 'rxjs'
import { DialogModule } from 'primeng/dialog'
import { ButtonModule } from 'primeng/button'
import { DateTime, Duration } from 'luxon'
import { AuthService } from '../../services/auth'
import { Router } from '@angular/router'

@Component({
  selector: 'app-session-watcher',
  imports: [
    DialogModule,
    ButtonModule,
  ],
  templateUrl: './session-watcher.component.html',
  styleUrl: './session-watcher.component.scss'
})
export class SessionWatcherComponent {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)


  public showrelog$ = toSignal(this.authService.session$.pipe(
    switchMap(session =>  {
      if(session  == null){
        return of(false)
      }
      const delay = DateTime.fromSeconds(session.sessionExpires!)
        .minus(Duration.fromISO('PT5M'))
      return timer(delay.toJSDate()).pipe(
        map(() => true),
        tap(() => console.log('Session expiring soon')),
      )
    }),
  ), { initialValue: false })

  public reLog() {
    this.authService.logout(false)
    this.router.navigate(['/auth'])
  }
  public ok() {
    this.authService.logout(false)
    this.router.navigate(['/auth'])
  }
}
