import { Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ButtonModule } from 'primeng/button'
import { catchError, map, of, share, startWith, Subject, switchMap } from 'rxjs'
import { AuthService } from '../../services/auth'
import { HttpRequestStatus } from '../../shared/models/http-request.status'

@Component({
  selector: 'app-discord-auth',
    imports:  [ButtonModule, ],
  templateUrl: './discord-auth.component.html',
  styleUrl: './discord-auth.component.scss'
})
export class DiscordAuthComponent {
  private readonly authService = inject(AuthService)
  private readonly authTrigger$$ = new Subject<void>()
  private readonly authResponse$ = this.authTrigger$$.pipe(
    switchMap(() => this.authService.getDiscordUrl()),
    share(),
  )
  private readonly authStatus$ = this.authResponse$.pipe(
    map(() => HttpRequestStatus.FINISHED),
    catchError(() => of(HttpRequestStatus.ERROR)),
    startWith(HttpRequestStatus.LOADING)
  )
  readonly authStatus = toSignal(this.authStatus$, {initialValue: HttpRequestStatus.IDLE})
  readonly isLoading = computed(() => HttpRequestStatus.LOADING === this.authStatus())
  readonly isError = computed(() => HttpRequestStatus.ERROR === this.authStatus())
  readonly isSuccess = computed(() => HttpRequestStatus.FINISHED === this.authStatus())

  readonly discordUrl =  toSignal(this.authResponse$)

  ngOnInit(): void {
    this.authTrigger$$.next()
  }

  onAuth(): void{
    const url = this.discordUrl()
    if(!url){
      //TODO display error 
      return
    }
    window.location.href = url
  }
}
