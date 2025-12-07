import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { of, switchMap, map, } from 'rxjs'
import { DialogModule } from 'primeng/dialog'
import { ButtonModule } from 'primeng/button'
import { DateTime, Duration } from 'luxon'
import { AuthService } from '../../services/auth'
import { Router } from '@angular/router'
import { safeTimer } from '../../shared/rxjs/safeTimer'

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
      if(session?.sessionExpires == null){
        return of(false)
      }
      const dueDate = DateTime.fromSeconds(session.sessionExpires)
        .minus(Duration.fromISO('PT5M'))
      return safeTimer(dueDate.diffNow().toMillis()).pipe(
        map(() => true),
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
