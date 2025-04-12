import { Component, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { BehaviorSubject, debounceTime, filter, map, share, startWith, tap } from 'rxjs'
import { toSignal } from '@angular/core/rxjs-interop'
import { v4 as uuid } from 'uuid'
import { TableModule } from 'primeng/table'
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete'
import { ButtonModule } from 'primeng/button'
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { MultiSelectModule } from 'primeng/multiselect'
import { IRight, IStream } from '../../../services/streams/stream.interface'
import { UsersService } from '../../../services/users/users.service'
import { StreamsService } from '../../../services/streams/streams.service'
import { MessageService } from 'primeng/api'

type _IRights = {user_id: string, username: string, rights: Array<string>}

@Component({
  selector: 'app-edit-stream',
  imports: [
    FormsModule, InputGroupModule, InputGroupAddonModule,
    ButtonModule, TableModule, AutoCompleteModule,
    MultiSelectModule, 
  ],
  templateUrl: './edit-stream.component.html',
  styleUrl: './edit-stream.component.scss',
})
export class EditStreamComponent {
  private readonly streamService = inject(StreamsService)
  private readonly usersService = inject(UsersService)
  private readonly messageService = inject(MessageService)

  public readonly stream = model.required<Partial<IStream>>()
  public readonly saved = output<IStream<Omit<IRight, 'username'>>>()
  public readonly cancelled = output<void>()

  private readonly searchUser$$ = new BehaviorSubject<string | null>(null)
  private readonly _searchUser$ = this.searchUser$$.pipe(
    filter(val => (val?.length ?? 0) > 0),
    debounceTime(250),
    tap((val) => this.usersService.searchByName(val as string)),
    map(() => true),
    startWith(false),
    share(),
  )
  readonly searchUser$ = toSignal(this._searchUser$)
  readonly userList$ = toSignal(this.usersService.userList$.pipe(
    map(users => users
      .filter(({id}) => this.stream().rights?.every(
        ({user_id}) => user_id !== id
      ) ?? true)
    )
  ))

  readonly streamRights = signal<Array<_IRights>>([])
  private readonly streamEffect = effect(() => this.streamRights.set(this.stream()?.rights?.reduce((acc: Array<_IRights>, val) => {
    let index = acc.findIndex(({user_id}) => user_id === val.user_id)
    const result = [...acc]
    if(index === -1){
      index = acc.length
      result.push({
        user_id: val.user_id,
        username: val.username,
        rights: [],
      })
    }
    result[index] = {
      ...result[index],
      rights: [
        ...result[index].rights,
        val.right
      ]
    }
    return result
  }, []) ?? []))
  readonly searchField = signal<{id: string, name: string} | null>(null)
  readonly userList = signal<Array<{id: string, name: string}> | null>(null)
  readonly availableRights = [
    {
      code: 'man',
      label: 'Administrateur'
    },
    {
      code: 'mod',
      label: 'Modérateur'
    },
    {
      code: 'plan',
      label: 'Planificateur'
    },
  ]

  search($event: AutoCompleteCompleteEvent){
    this.searchUser$$.next($event.query)
  }
  add(){
    const newUser = this.searchField()
    if(!newUser){
      return;
    }
    this.stream.set({
      ...this.stream(),
      rights: [
        ...this.stream().rights ?? [],
        {
          right: 'mod',
          user_id: newUser.id,
          username: newUser.name,
        }
      ]
    })
    this.searchField.set(null)
  }

  cancel(){
    this.cancelled.emit()
  }
  save(){
    const stream = this.stream()
    let hasError = false
    if(stream.name == undefined){
      this.messageService.add({ severity: 'error', summary: 'Le nom du stream doit être défini'})
      hasError = true
    }
    if(stream.twitchId == undefined){
      this.messageService.add({ severity: 'error', summary: 'L\'id nom du stream doit être défini'})
      hasError = true
    }
    if(stream.urlHandle == undefined){
      this.messageService.add({ severity: 'error', summary: 'Le nom du stream doit être défini'})
      hasError = true
    }
    if(hasError){
      return
    }
    const toSave = {
      id: stream.id ?? uuid(),
      name: stream.name!,
      twitchId: stream.twitchId!,
      urlHandle: stream.urlHandle!,
      enabled: stream.enabled!,
      rights: this.streamRights()
        .flatMap(({user_id, rights}) => rights
        .map(right => ({
          user_id,
          right
        })))
    }
    this.streamService.update(toSave)
    this.saved.emit(toSave)
  }
}
