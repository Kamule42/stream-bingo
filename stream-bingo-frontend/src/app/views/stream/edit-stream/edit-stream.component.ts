import { v7 as uuid } from 'uuid'
import { Component, Input, computed, effect, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { Observable, tap } from 'rxjs'
import { Router } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { CheckboxModule } from 'primeng/checkbox'
import { InputTextModule } from 'primeng/inputtext'
import { TextareaModule } from 'primeng/textarea'
import { MessageService } from 'primeng/api'
import { SessionService } from '../../../services/session/session.service'
import { ICell, IStream } from '../../../services/streams/stream.interface'
import { StreamsService } from '../../../services/streams/streams.service'

@Component({
  selector: 'app-edit-stream',
  imports: [
    FormsModule, ProgressSpinnerModule, TableModule, ButtonModule,
    CardModule, CheckboxModule, InputTextModule,
    TextareaModule,],
  templateUrl: './edit-stream.component.html',
  styleUrl: './edit-stream.component.scss'
})
export class EditStreamComponent {
  private readonly streamService = inject(StreamsService)
  private readonly sessionService = inject(SessionService)
  private readonly router = inject(Router)
  private readonly messageService = inject(MessageService)

  private _webhandle = ''
  @Input()
  set webhandle(webhandle: string) {
    this._webhandle = webhandle
  }

  readonly toEdit = signal<Partial<Omit<IStream, 'cells'>> & { cells?: Partial<ICell>[] }>({})

  readonly stream$ = toSignal<IStream>(this.streamService.streamDetail$.pipe(
    tap(stream => this.toEdit.set({
      ...(stream ? JSON.parse(JSON.stringify(stream as IStream)) : undefined),
      cells: this.toEdit()?.cells ? JSON.parse(JSON.stringify(this.toEdit()?.cells)) : undefined,
    })),
    tap(stream => {
      if (stream) {
        this.streamService.fetchCells(stream.id)
      }
    })
  ) as Observable<IStream>)
  readonly isAdmin$ = computed(() => {
    const stream = this.stream$()
    if (stream == null) {
      return false
    }
    return this.sessionService.isAdmin ||
      this.sessionService.isStreamManager(stream.id)
  })
  private readonly accessEffect = effect(() => {
    if (this.isAdmin$() === false && this.stream$() !== undefined) {
      this.router.navigateByUrl(this.router.url.replace('/edit', ''))
    }
  })

  readonly cells$ = toSignal(this.streamService.cells$.pipe(
    tap(cells => this.toEdit.set({
      ...(this.toEdit() ? JSON.parse(JSON.stringify(this.toEdit())) : undefined),
      cells: cells ? JSON.parse(JSON.stringify(cells)) : undefined,
    })),
  ), { initialValue: undefined })

  save() {
    this.streamService.updateCells(this.stream$()?.id, this.toEdit().cells)
    this.messageService.add({ severity: 'info', summary: 'Sauvegardé'})
  }
  cancel() {
    this.router.navigate(['s', this._webhandle])
  }

  addNewCell() {
    this.toEdit.set({
      ...this.toEdit(),
      cells: [
        ...this.toEdit()?.cells ?? [],
        { id: uuid() }
      ]
    })
  }

  stopNavigation($event: KeyboardEvent){
    switch($event.key){
      case 'ArrowDown':
      case 'Down':
      case 'ArrowRight':
      case 'Right':
      case 'ArrowUp':
      case 'Up':
      case 'ArrowLeft':
      case 'Left':
        $event.stopPropagation()
    }
  }
}
