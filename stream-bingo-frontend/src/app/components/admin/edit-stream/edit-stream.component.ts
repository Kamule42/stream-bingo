import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { BehaviorSubject, debounceTime, filter, map, share, startWith, tap } from 'rxjs'
import { toSignal } from '@angular/core/rxjs-interop'
import { TableModule } from 'primeng/table'
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete'
import { ButtonModule } from 'primeng/button'
import { InputGroupModule } from 'primeng/inputgroup'
import { IStream } from '../../../services/streams/stream.interface'
import { UsersService } from '../../../services/users/users.service'

@Component({
  selector: 'app-edit-stream',
  imports: [FormsModule, InputGroupModule, ButtonModule, TableModule, AutoCompleteModule ],
  templateUrl: './edit-stream.component.html',
  styleUrl: './edit-stream.component.scss'
})
export class EditStreamComponent {
  private readonly usersService = inject(UsersService)

  private readonly searchUser$$ = new BehaviorSubject<string | null>(null)
  private readonly _searchUser$ = this.searchUser$$.pipe(
    tap(val => console.log(val)),
    filter(val => (val?.length ?? 0) > 0),
    debounceTime(250),
    tap((val) => this.usersService.searchByName(val as string)),
    map(() => true),
    startWith(false),
    share(),
  )
  readonly searchUser$ = toSignal(this._searchUser$)
  readonly userList$ = toSignal(this.usersService.userList$)

  readonly stream = model.required<Partial<IStream>>()
  readonly searchField = signal<string | null>(null)
  readonly userList = signal<Array<{id: string, name: string}> | null>(null)

  search($event: AutoCompleteCompleteEvent){
    this.searchUser$$.next($event.query)
  }
}
