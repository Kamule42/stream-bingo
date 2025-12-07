import { Component, inject, input, model, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'
import { StreamsService } from '../../../services/streams/streams.service'
import { tap } from 'rxjs'

@Component({
  selector: 'app-season-picker',
  imports: [],
  templateUrl: './season-picker.component.html',
  styleUrl: './season-picker.component.scss',
})
export class SeasonPickerComponent implements OnInit {
  readonly streamService = inject(StreamsService)

  readonly streamId = input.required<string>()
  readonly autoSelectLast = input<boolean>(true)
  readonly unselectable = input<boolean>(true)

  readonly selectedSeason = model(null as string | null)
  readonly seasons$ = toSignal(this.streamService.seasons.value$.pipe(
    tap(seasons => {
      if(this.autoSelectLast() && this.selectedSeason() == null && seasons.length > 0){
        this.selectedSeason.set(seasons[0].id)
      }
    })
  ))

  ngOnInit(): void {
    this.streamService.seasons.load({ streamId: this.streamId() })
  }

  flip(seasonId: string): void {
    if(this.selectedSeason() === seasonId && this.unselectable()){
      this.selectedSeason.set(null)
    }
    else if(this.selectedSeason() !== seasonId){
      this.selectedSeason.set(seasonId)
    }
  }
}
