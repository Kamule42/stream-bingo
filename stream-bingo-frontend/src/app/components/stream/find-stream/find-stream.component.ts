import { Component, inject, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { InputTextModule } from 'primeng/inputtext'
import { BehaviorSubject, debounceTime, map, shareReplay, startWith, switchMap, tap } from 'rxjs'
import { StreamsService } from '../../../services/streams/streams.service'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-find-stream',
  imports: [
    FormsModule ,InputTextModule,
    InputGroupModule, InputGroupAddonModule,
    ButtonModule, ProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './find-stream.component.html',
  styleUrl: './find-stream.component.scss'
})
export class FindStreamComponent implements OnDestroy {
  private readonly streamService = inject(StreamsService)

  readonly search$ = signal<string | undefined>(undefined)
  readonly results$ = toSignal(this.streamService.searchResult$)

  private readonly searchStream$$ = new BehaviorSubject<string | null>(null)
  private readonly _loading$ = this.searchStream$$.pipe(
    debounceTime(250),
    tap((val) => {
      this.streamService.searchByName(val ?? '')
    }),
    switchMap(() => this.streamService.searchResult$.pipe(
      map(() => false),
      startWith(true)
    )),
    startWith(false),
    shareReplay(1),
  )
  readonly loading$ = toSignal(this._loading$,)

  onSearchChange($event: string){
    this.searchStream$$.next($event)
  }
  ngOnDestroy(): void {
    this.streamService.searchByName('')
  }
}
