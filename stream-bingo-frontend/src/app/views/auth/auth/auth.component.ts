import { Component, computed, inject, OnInit, } from '@angular/core'
import { AuthService } from '../../../services/auth'
import { catchError, map, of, startWith, Subject, switchMap } from 'rxjs'
import { HttpRequestStatus } from '../../../shared/models/http-request.status'
import { toSignal } from '@angular/core/rxjs-interop'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { ProgressSpinnerModule } from 'primeng/progressspinner'

@Component({
  selector: 'app-auth',
  imports:  [ButtonModule, CardModule, ProgressSpinnerModule, ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  standalone: true,
})
export class AuthComponent implements OnInit {
  private readonly authService: AuthService = inject(AuthService)
  private readonly authTrigger$$: Subject<void> = new Subject<void>()
  private readonly authResponse$ = this.authTrigger$$.pipe(
    switchMap(() => this.authService.getDiscordUrl())
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

  readonly discordUrl = toSignal(this.authResponse$)

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
