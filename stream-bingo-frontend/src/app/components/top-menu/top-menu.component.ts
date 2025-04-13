import { Component, computed, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MenubarModule } from 'primeng/menubar'
import { AvatarModule } from 'primeng/avatar'
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button'
import { AuthService } from '../../services/auth'
import { DiscordAuthComponent } from '../discord-auth/discord-auth.component'
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { SessionService } from '../../services/session/session.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { Ripple } from 'primeng/ripple';
import { SettingsComponent } from "../settings/settings.component";

@Component({
  selector: 'app-top-menu',
  imports: [
    CommonModule,
    DiscordAuthComponent, MenubarModule,
    AvatarModule, MenuModule, ButtonModule, RouterLink,
    DialogModule, Ripple,
    SettingsComponent
],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.scss',
})
export class TopMenuComponent {
  private readonly authService = inject(AuthService)
  private readonly sessionService = inject(SessionService)

  readonly session = this.sessionService.session$
  readonly isConnected = computed(() => this.session() != null) // not null nor undefined
  readonly isDisconnected = computed(() => this.session() === null) // only null
  readonly favs = this.sessionService.favs

  readonly showSettingDialog = signal(false)


  readonly items = computed(() => {
    const result: Array<MenuItem> = [
      {
        label: 'BStreamgo',
        icon: 'mdi mdi-home-outline',
        route: '/',
      },
    ]
    if(this.sessionService.isAuthenticated){
      result.push({
        label: 'Mes favoris',
        icon: 'mdi mdi-star-outline',
        route: '/@me/favs',
        items: this.favs()
          ?.map(fav => ({
            label: fav.streamName,
            route: `/s/${fav.streamTwitchHandle}`
          }))
      })
    }
    if(this.sessionService.isAdmin){
      result.push({
        label: 'Administration',
        icon: 'mdi mdi-shield-crown-outline',
        route: '/admin',
      })
    }
    return result
  })

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
