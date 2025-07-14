import { inject, Injectable } from '@angular/core'
import { distinctUntilChanged, filter, fromEvent, map, merge, mergeMap, pairwise, shareReplay, startWith, Subject, tap, throttle, throttleTime } from 'rxjs'
import { IEditRound, IRound, RoundStatus } from './round.interface'
import { WebsocketService } from '../ws/websocket.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { GridService } from '../grids/grid.service'
import { VisibilityService } from '../visibility/visibility.service'
import { ISeason } from '../streams/stream.interface'


@Injectable({
  providedIn: 'root'
})
export class RoundsService extends WebsocketService{
  protected readonly visibilityService = inject(VisibilityService)

  constructor(){
    super('/rounds' )
  }

  private readonly gridService = inject(GridService)

  private readonly invalidateRound = new Subject()

  readonly currentRound$ = merge(
    this.invalidateRound.asObservable().pipe(
      map(() => null),
    ),
    fromEvent<IRound>(this.socket, 'roundDetail'),
    fromEvent<void>(this.socket, 'noRoundDetail').pipe(map(() => null)),
  ).pipe(
    shareReplay(1),
  )

  protected readonly reconnectToRound$ =  this.visibilityService.isVisible$.pipe(
    distinctUntilChanged(),
    filter(val => val),
    mergeMap(() => this.currentRound$),
  )

  private readonly _roundSubscription = merge(
    this.currentRound$,
    this.reconnectToRound$,
  ).pipe(
    startWith(null),
    pairwise(),
  ).subscribe({
    next: ([oldRound, newRound]) => {
      if(oldRound != null){
        this.gridService.unsubscribeForRound(oldRound.id)
      }
      if(newRound != null){
        this.gridService.subscribeForRound(newRound.id)
      }
    }
  })



  readonly streamNexRouds$ = fromEvent<IRound[]>(this.socket, 'streamRounds').pipe(
    map(rounds => rounds),
    shareReplay(1),
  )

  private readonly fetchCurrentRoundForStream$$ = new Subject<string | null>()
  private readonly _fetchCurrentRoundForStream$ = toSignal(this.fetchCurrentRoundForStream$$.asObservable().pipe(
    distinctUntilChanged(),
    filter(val => val != null),
    tap(() => this.invalidateRound.next(null)),
    tap(() => this.fetchRoundForGrid$$.next(null)),
    tap(streamId => this.sendMessage('getCurrentRoundForStream', {streamId}))
  ))
  public fetchCurrentRoundForStream(streamId: string) {
    this.fetchCurrentRoundForStream$$.next(streamId)
  }

  private readonly fetchRoundForGrid$$ = new Subject<string | null>()
  private readonly _fetchRoundForGrid$ = toSignal(this.fetchRoundForGrid$$.asObservable().pipe(
    distinctUntilChanged(),
    filter(val => val != null),
    tap(() => this.fetchCurrentRoundForStream$$.next(null)),
    tap(() => this.invalidateRound.next(null)),
    tap(gridId => this.sendMessage('getRoundForGrid', {gridId}))
  ))
  public fetchRoundForGrid(gridId: string) {
    this.fetchRoundForGrid$$.next(gridId)
  }

  private readonly fetchRoundsForStream$$ = new Subject<string>()
  private readonly _fetchRoundForStream$ = toSignal(this.fetchRoundsForStream$$.asObservable().pipe(
    throttleTime(100),
    tap(streamId => this.sendMessage('getRoundsForStream', {streamId})),
  ))
  public fetchRoundsForStream(streamId: string) {
    this.fetchRoundsForStream$$.next(streamId)
  }

  public updateCurrentRoundStatus(roundId: string, streamId: string, status: RoundStatus){
    this.sendMessage('updateStreamStatus', { roundId, streamId, status})
  }
  public createRound(streamId: string, round: IEditRound, newSeason?: ISeason): void {
    this.sendMessage('createRound', {
      streamId,
      round,
      newSeason
    })
  }
}
