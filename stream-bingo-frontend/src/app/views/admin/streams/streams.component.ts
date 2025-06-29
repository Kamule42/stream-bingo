import { Component, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'
import { TableModule } from 'primeng/table'
import { PaginatorModule, PaginatorState } from 'primeng/paginator'
import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { IPagination } from '../../../shared/models/pagination.interface';
import { StreamsService } from '../../../services/streams/streams.service';
import { EditStreamComponent } from '../../../components/admin/edit-stream/edit-stream.component'
import { IStream } from '../../../services/streams/stream.interface';

@Component({
  selector: 'app-streams',
  imports: [TableModule, PaginatorModule, DialogModule, ButtonModule, EditStreamComponent,  ],
  templateUrl: './streams.component.html',
  styleUrl: './streams.component.scss'
})
export class StreamsComponent{
  private readonly streamService = inject(StreamsService)

  
  readonly showDialog$ = signal(false)
  readonly toEdit$ = signal<Partial<IStream>>({})
  readonly modalTitle$ = computed(() => this.toEdit$()?.id === undefined ? 'Ajouter un stream' : 'Modifier le stream')

  private readonly _streams$ = this.streamService.streams$
  readonly streams$ = toSignal(this._streams$, {initialValue: undefined})

  private readonly _streamMeta$ = this.streamService.streamMeta$
  readonly streamMeta$ = toSignal(this._streamMeta$, {initialValue: undefined})
  readonly totalItems$ = computed(() => this.streamMeta$()?.totalItems)

  page: WritableSignal<number> = signal(0)
  limit: WritableSignal<number> = signal(25)
  private readonly pagination = computed<IPagination>(() => ({
    page: this.page(),
    limit: this.limit(),
  }))

  private readonly reloadEffect = effect(() => {
    this.streamService.listStreams(this.pagination())
  })

    
  updatePagination($event: PaginatorState) {
    this.page.set($event.page ?? 0)
    this.limit.set($event.rows ?? 0)
  }
  addStream(){
    this.toEdit$.set({})
    this.showDialog$.set(true)
  }
  editStream(stream: IStream){
    this.toEdit$.set(stream)
    this.showDialog$.set(true)
  }
  reload(){
    this.streamService.listStreams(this.pagination())
  }
}
