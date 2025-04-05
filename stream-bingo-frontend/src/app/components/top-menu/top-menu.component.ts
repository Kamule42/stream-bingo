import { Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MenubarModule } from 'primeng/menubar'
import { AvatarModule } from 'primeng/avatar'
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button'
import { AuthService } from '../../services/auth'
import { DiscordAuthComponent } from '../discord-auth/discord-auth.component'
import { NgcCookieConsentService } from 'ngx-cookieconsent';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-menu',
  imports: [ DiscordAuthComponent, MenubarModule, AvatarModule, MenuModule, ButtonModule, RouterLink ],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.scss',
})
export class TopMenuComponent {
  private readonly authService = inject(AuthService)
  private readonly session$ = this.authService.session$
  private readonly ccSerice = inject(NgcCookieConsentService)

  readonly session = toSignal(this.session$, {initialValue: undefined}) 
  readonly isConnected = computed(() => this.session() != null) // not null nor undefined
  readonly isDisconnected = computed(() => this.session() === null) // only null

  readonly items = [
    {
      label: 'BStreamgo',
      icon: 'mdi mdi-home-outline',
      route: '/',
    },
  ]

  readonly logoutItems = [
    {
      label: 'Déconnexion',
      icon: 'mdi mdi-logout',
      command: () =>  this.logout()
    }
  ]
  
  public logout(){
    this.authService.logout()
  }
}
