import { Component, computed, inject } from '@angular/core'
import { AuthService } from '../../services/auth'
import { toSignal } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-top-menu',
  imports: [RouterLink],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.scss',
})
export class TopMenuComponent {
  private readonly authService = inject(AuthService)
  private readonly session$ = this.authService.session$

  readonly session = toSignal(this.session$, {initialValue: undefined}) 
  readonly isConnected = computed(() => this.session() != null) // not null nor undefined
  readonly isDisconnected = computed(() => this.session() === null) // only null
}
