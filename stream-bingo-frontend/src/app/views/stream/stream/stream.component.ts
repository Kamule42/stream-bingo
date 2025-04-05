import { Component, inject, OnInit, signal } from '@angular/core';
import { StreamsService } from '../../../services/streams/streams.service';
import { map, switchMap, timer } from 'rxjs';
import { DateTime, Interval } from 'luxon';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-stream',
  imports: [ProgressSpinnerModule],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss'
})
export class StreamComponent implements OnInit{
  private readonly streamService = inject(StreamsService)
  private readonly route = inject(ActivatedRoute)

  private readonly _stream$ = this.streamService.streamDetail$.pipe(
      switchMap((stream) => timer(0, 1000).pipe(
        map(() => stream)
      )),
      map(stream =>  stream ? {
        ...stream,
        nextStreamStartsAtTxt: stream.nextStreamStartsAt ? 
          Interval.fromDateTimes(DateTime.now(), stream.nextStreamStartsAt)
          .toDuration(['days', 'hours', 'minutes', 'seconds'])
          .toHuman({
            listStyle: 'long',
            unitDisplay: 'short',
            maximumFractionDigits: 0
          }) : null,
        nextStreamStartsAtIso:  stream.nextStreamStartsAt?.toISO(),
      } : null),
    )
  readonly stream$ = toSignal(this._stream$, {initialValue: undefined})
  readonly noWebhandle$ = signal<boolean>(false)
  
  ngOnInit(): void {
    this.noWebhandle$.set(false)
    const webhandle = this.route.snapshot.paramMap.get('webhandle')
    if(!webhandle){
      this.noWebhandle$.set(true)
      return
    }
    this.streamService.fetchDetails(webhandle)
  }
}
