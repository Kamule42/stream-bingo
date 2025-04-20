import { Component, computed, effect, inject, model, output, signal } from '@angular/core'
import { v7 as uuid } from 'uuid'
import { IEditRound } from '../../services/rounds/round.interface'
import { DateTime } from 'luxon'
import { map, timer } from 'rxjs'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { InputTextModule } from 'primeng/inputtext'
import { DatePickerModule } from 'primeng/datepicker'
import { ButtonModule } from 'primeng/button'
import { PopoverModule } from 'primeng/popover'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { ConfirmationService } from 'primeng/api'

type Iblock = {
  type: 'round',
  id: string,
  weight: number,
  roundId: string
} | {
  type: 'space',
  id: string,
  weight: number,
  pos: number,
}

interface IError{
  field: 'start' | 'streamStart' | 'both'
  message: string
}


@Component({
  selector: 'app-timeline',
  imports: [ 
    FormsModule, 
    InputTextModule, DatePickerModule,
    IconFieldModule, InputIconModule,
    ButtonModule, PopoverModule,  ],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  private readonly confirmService = inject(ConfirmationService)

  readonly rounds$ = model.required<IEditRound[] | undefined>({
    alias: 'rounds'
  })
  readonly isValid = output<boolean>()
  readonly roundsToDelete = output<string[]>()
  readonly _toDelete$ = signal<string[]>([])

  private readonly _isValidEffect = effect(() => {
    this.isValid.emit(this.isValid$())
  })
  private readonly newIds = signal<string[]>([])

  private readonly _now$ = timer(0,1000).pipe(
    map(() => DateTime.now().toSeconds()*1000),
  )
  readonly now$ = toSignal(this._now$, {initialValue:  DateTime.now().toSeconds()*1000})

  readonly duration$ = computed(() => {
    const rounds = this.rounds$()
    if(rounds === undefined){
      return undefined
    }
    if( rounds.length === 0){
      return 1;
    }
    const now = this.now$()
    const blocks = rounds.toSorted((a,b) => a.startAt.getTime() - b.startAt.getTime())
    const max = blocks.reduce<number>((max, round) => 
      max === undefined || max < round.streamStartAt.getTime() ? round.streamStartAt.getTime() : max, 0)
     return max ? max  - now : undefined
  })

  readonly blocks$ = computed<Iblock[] | undefined>(() => {
    const rounds = this.rounds$()
    if(rounds === undefined){
      return undefined
    }
    if(rounds.length === 0){
      return [
        {
          type: 'space',
          weight: 1,
          id: 'space-now',
          pos: 0,
        }
      ]
    }

    const now = this.now$()
    const duration = this.duration$()! * 0.9;
    const blocks = rounds.toSorted((a,b) => a.startAt.getTime() - b.startAt.getTime())
    const result = new Array<Iblock>()

    const firstStart = blocks[0].startAt.getTime()
    if(firstStart > now){
      result.push({
        type: 'space',
        weight: (firstStart - now) / duration,
        id: 'space-now',
        pos: 0,
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
          pos: index + 1
        })
      }
      else{   
        result.push({
          type: 'space',
          weight: 0.1,
          id: 'space-end',
          pos: index + 1
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
        const round = this.roundMap$()!.get(block.roundId)!.round
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

  readonly roundErrors$ = computed(() => {
    const result = new Map<string, IError[]>()
    const rounds = this.rounds$()
    if(rounds === undefined){
      return result
    }
    rounds.forEach((round, index) => {
      const errors: IError[] = []
      if(round.startAt.getTime() > round.streamStartAt.getTime()){
        errors.push({
          field: 'both',
          message: 'La date , doit être avant la date de début de stream estimée'
        })
      }
      if(index > 0 && round.startAt.getTime() < rounds[index-1].streamStartAt.getTime()){
        errors.push({
          field: 'start',
          message: 'La date d\'ouverture de la grille doit être après la date de début de stream estimée de la partie précédente'
        })
      }

      if(
        index < (rounds.length - 1) &&
        round.streamStartAt.getTime() > rounds[index+1].startAt.getTime()
      ){
        errors.push({
          field: 'streamStart',
          message: 'La date d\'ouverture de la grille estimée doit être avant la date de début de stream estimée de la partie suivante'
        })
      }
      result.set(round.id, errors)
    })
    return result
  })
  readonly roundMap$ = computed(() => {
    const errors = this.roundErrors$()
    const rounds = this.rounds$()
    if(errors === undefined || rounds === undefined){
      return undefined
    }
    return rounds
      ?.reduce((map, round) => {
        const err = errors.get(round.id) ?? []
        return map.set(round.id, {
          round,
          errors: err,
          hasStartError: err.find(({field}) => ['start', 'both'].includes(field)) !== undefined,
          hasStreamStartError: err.find(({field}) => ['streamStart', 'both'].includes(field)) !== undefined,
        })
      },
      new Map<string, {round: IEditRound, errors: IError[], hasStartError: boolean, hasStreamStartError: boolean }>())
  })


  readonly isValid$ = computed(() => [...this.roundErrors$().values()].every(errs => errs.length === 0))

  readonly totalGrowths = computed(() => {
    const blocks = this.blocks$()
    if(!blocks){
      return undefined
    }
    return blocks.reduce((acc, b) => acc + b.weight, 0)
  })

  public addRound(pos: number){
    const rounds = this.rounds$() ?? []
    const now = DateTime.now()
    const id = uuid()
    this.newIds.set([...this.newIds(), id])
    if(pos === 0){
      this.rounds$.set([
        {
          id,
          name: 'Nouveau stream',
          startAt: now.toJSDate(),
          streamStartAt: now.plus({hour: 4}).toJSDate()
        },
        ...rounds
      ])
    }
    else if(pos >= rounds.length){
      const lastRoundStart = rounds
        .map(({streamStartAt}) => DateTime.fromJSDate(streamStartAt))
        .at(-1) ?? now
      this.rounds$.set([
        ...rounds, 
        {
          id,
          name: 'Nouveau stream',
          startAt: lastRoundStart.plus({hour: 4}).toJSDate(),
          streamStartAt:  lastRoundStart.plus({day: 1}).toJSDate(),
        },
      ])
    }
    else{
      const lastRoundStart = rounds
        .map(({streamStartAt}) => DateTime.fromJSDate(streamStartAt))
        .at(pos-1) ?? now
      this.rounds$.set([
        ...rounds.slice(0, pos), 
        {
          id,
          name: 'Nouveau stream',
          startAt: lastRoundStart.plus({minute: 5}).toJSDate(),
          streamStartAt:  lastRoundStart.plus({minute: 10}).toJSDate(),
        },
        ...rounds.slice(pos)
      ])
    }
  }

  deleteRound(roundId: string){
    const rounds = this.rounds$()
    if(rounds === undefined){
      return
    }
    const isCurrentRound = rounds.find(({ id, startAt }) => id === roundId && startAt <= new Date()) !== undefined
    if(isCurrentRound){
      this.confirmService.confirm({
        header: 'Attention',
        message: 'Cette grille est déjà ouverte, voulez-vous vraiment la supprimer ?',
        closable: true,
        closeOnEscape: true,
        icon: 'mdi mdi-alert-outline',
        rejectButtonProps: {
          label: 'Annuler',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          icon: 'mdi mdi-delete-outline',
          label: 'Supprimer',
          severity: 'danger',
        },
        accept: () => this.doDeleteRound(roundId)
      })
    }
  }

  private doDeleteRound(roundId: string){
    const rounds = this.rounds$()
    if(rounds === undefined){
      return
    }
    this.rounds$.set(rounds.filter(({id}) => id !== roundId))
    if(!this.newIds().includes(roundId)){
      this._toDelete$.set([...this._toDelete$(), roundId])
      this.roundsToDelete.emit(this._toDelete$())
    }
    this.newIds.set(this.newIds().filter(val => val!== roundId))
  }

  triggerRecompute(){
    const rounds = this.rounds$()
    this.rounds$.set(rounds ?
      rounds.toSorted((a,b) => a.startAt.getTime() - b.startAt.getTime()) :
      undefined)
  }
}
