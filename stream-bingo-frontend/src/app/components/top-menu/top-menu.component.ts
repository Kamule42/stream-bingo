import { Component, computed, inject, signal } from '@angular/core'
import { MenubarModule } from 'primeng/menubar'
import { AvatarModule } from 'primeng/avatar'
import { ButtonModule } from 'primeng/button'
import { RouterLink } from '@angular/router'
import { MenuItem } from 'primeng/api'
import { CommonModule } from '@angular/common'
import { DialogModule } from 'primeng/dialog'
import { Ripple } from 'primeng/ripple'
import { SessionService } from '../../services/session/session.service'
import { DiscordAuthComponent } from '../discord-auth/discord-auth.component'
import { AuthService } from '../../services/auth'
import { SettingsComponent } from "../settings/settings.component"

@Component({
  selector: 'app-top-menu',
  imports: [
    CommonModule,
    DiscordAuthComponent, MenubarModule,
    AvatarModule, ButtonModule, RouterLink,
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
    const result: MenuItem[] = [
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
  
}
