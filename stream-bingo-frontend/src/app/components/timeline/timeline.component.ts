import { Component, computed, model } from '@angular/core';
import { IRound } from '../../services/rounds/round.interface'
import { DateTime } from 'luxon'
import { map, timer } from 'rxjs'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { InputTextModule } from 'primeng/inputtext'
import { DatePickerModule } from 'primeng/datepicker'

@Component({
  selector: 'app-timeline',
  imports: [ FormsModule, InputTextModule, DatePickerModule, ],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  readonly rounds = model.required<IRound[] | undefined>()
  private readonly _now$ = timer(0,1000).pipe(
    map(() => DateTime.now().toSeconds()*1000),
  )
  readonly now$ = toSignal(this._now$, {initialValue:  DateTime.now().toSeconds()*1000})

  readonly duration$ = computed(() => {
    const rounds = this.rounds()
    if(rounds === undefined || rounds.length === 0){
      return undefined
    }
    const now = this.now$()
    const blocks = rounds.toSorted((a,b) => a.startAt.getTime() - b.startAt.getTime())
    const max = blocks.reduce<number>((max, round) => 
      max === undefined || max < round.streamStartAt.getTime() ? round.streamStartAt.getTime() : max, 0)
     return max ? max  - now : undefined
  })

  readonly blocks$ = computed(() => {
    const rounds = this.rounds()
    if(rounds === undefined || rounds.length === 0){
      return undefined
    }
    const now = this.now$()
    const duration = this.duration$()!;
    const blocks = rounds.toSorted((a,b) => a.startAt.getTime() - b.startAt.getTime())
    const result = new Array<{type: 'round' | 'space', weight: number, roundId?: string, id: string}>()

    const firstStart = blocks[0].startAt.getTime()
    if(firstStart > now){
      result.push({
        type: 'space',
        weight: (firstStart - now) / duration,
        id: 'space-now',
      })
    }
    blocks.forEach((round, index) => {
      result.push({
        type: 'round',
        weight: (round.streamStartAt.getTime() - round.startAt.getTime()) / duration,
        roundId: round.id,
        id: `round-${round.id}`,
      })
      if(index < blocks.length - 1){
        result.push({
          type: 'space',
          weight: (blocks[index+1].startAt.getTime() - round.streamStartAt.getTime()) / duration,
          id: `space-${round.id}`,
        })
      }
    })
    return result
  })
  readonly dates$ = computed(() => {
    const blocks = this.blocks$()
    if(blocks === undefined){
      return undefined
    }
    const now = this.now$()
    const result = new Array<{
      id: string,
      type: 'date' | 'space', 
      dateTxt?: string,
      weight: number
    }>()
    result.push( {
      id: `now`,
      type: 'date',
      dateTxt: DateTime
        .fromMillis(now)
        .toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
        weight: 0
    })
    blocks.forEach(block => {
      if(block.type === 'space'){
        result.push({
          id: block.id,
          type: 'space',
          weight: block.weight
        })
      }
      else{
        const round = this.roundMap$()!.get(block.roundId!)!
        if(round.startAt.getTime() > now){
          result.push(
            {
              id: `start-at-${round.id}`,
              type: 'date',
              dateTxt: DateTime
                .fromJSDate(round.startAt)
                .toLocaleString(DateTime.DATETIME_SHORT),
                weight: 0
            })
        }
        result.push(
          {
            id: `inner-space-${round.id}`,
            type: 'space',
            weight: block.weight
          },{
            id: `stream-start-at-${round.id}`,
            type: 'date',
            dateTxt: DateTime
              .fromJSDate(round.streamStartAt)
              .toLocaleString(DateTime.DATETIME_SHORT),
              weight: 0
          },
        )
      }
    })
    return result
  })
  readonly roundMap$ = computed(() => this.rounds()
    ?.reduce((map, round) => map.set(round.id, round), new Map<string, IRound>())
  )
}
