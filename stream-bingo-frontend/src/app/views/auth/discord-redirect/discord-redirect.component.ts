import { Component, computed, inject, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'
import { catchError, delay, filter, map, of, startWith, Subject, switchMap, takeWhile, tap, timer } from 'rxjs'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { HttpRequestStatus } from '../../../shared/models/http-request.status'
import { AuthService } from '../../../services/auth/auth.service'
import { AsyncPipe } from '@angular/common'
import { CardModule } from 'primeng/card'

@Component({
  selector: 'app-discord-redirect',
  imports: [ProgressSpinnerModule, CardModule, AsyncPipe, RouterLink, ],
  templateUrl: './discord-redirect.component.html',
  styleUrl: './discord-redirect.component.scss',
  standalone: true,
})
export class DiscordRedirectComponent implements OnInit{
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  private readonly validateCode$ = this.route.queryParams.pipe(
    filter(({ code }) => code),
    switchMap(({ code }) => this.authService
      .validateCode(code)
      .pipe(
        map(() => HttpRequestStatus.FINISHED),
        startWith(HttpRequestStatus.LOADING),
        catchError(error => {
          console.error(error)
          return of(HttpRequestStatus.ERROR)
        }),
      ),
    ),
    startWith(HttpRequestStatus.IDLE),
  )

  private readonly validateCodeStatus = toSignal(this.validateCode$, {initialValue: HttpRequestStatus.IDLE})
  readonly isLoading = computed(() => HttpRequestStatus.LOADING === this.validateCodeStatus())
  readonly isError = computed(() => HttpRequestStatus.ERROR === this.validateCodeStatus())
  readonly isSuccess = computed(() => HttpRequestStatus.FINISHED === this.validateCodeStatus())
  
  private readonly downcounterTrigger$$ = new Subject<number>()
  readonly downcounter$ = this.downcounterTrigger$$.pipe(
    switchMap((total) => timer(0, 1000).pipe(
      map(v => total - v),
      takeWhile(v => v <= total)
    )),
  )

  ngOnInit(): void {
    const timer = 5
    this.validateCode$.pipe(
      filter(status => [HttpRequestStatus.FINISHED, HttpRequestStatus.ERROR].includes(status)),
      switchMap(status => status === HttpRequestStatus.FINISHED ?
        of(status) :
        of(status).pipe(
          tap(() => this.downcounterTrigger$$.next(timer)),
          delay(timer * 1000),
        )
      )
    ).subscribe({
      next: (status) => this.router.navigateByUrl(status === HttpRequestStatus.FINISHED ? '/' : '/auth')
    })
  }
}
