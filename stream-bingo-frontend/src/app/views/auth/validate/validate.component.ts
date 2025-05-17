import { Component, OnInit, computed, inject } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'
import { Subject, catchError, combineLatest, delay, filter, map, of, share, startWith, switchMap, takeWhile, tap, timer } from 'rxjs'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { AsyncPipe } from '@angular/common'
import { CardModule } from 'primeng/card'
import { HttpRequestStatus } from '../../../shared/models/http-request.status'
import { AuthService } from '../../../services/auth/auth.service'

@Component({
  selector: 'app-validate',
  imports: [ProgressSpinnerModule, CardModule, AsyncPipe, RouterLink, ],
  templateUrl: './validate.component.html',
  styleUrl: './validate.component.scss'
})
export class ValidateComponent implements OnInit{
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  private readonly code$ = this.route.queryParams.pipe(
    map(({ code }) => code),
    filter(code => code != null),
  )
  private readonly provider$ = this.route.data.pipe(
    map(({provider}) => provider),
    filter(provider => provider != null)
  )

  private readonly validateCode$ = combineLatest([this.code$, this.provider$]).pipe(
    switchMap(([code, provider]) => this.authService
      .validateCode(code, provider)
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
    share(),
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
      next: () => this.router.navigateByUrl('/')
    })
  }
}
