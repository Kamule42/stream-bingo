import { Component } from '@angular/core'
import { MenuItem } from 'primeng/api'
import { MenuModule } from 'primeng/menu'

@Component({
  selector: 'app-admin-menu',
  imports: [MenuModule, ],
  templateUrl: './admin-menu.component.html',
  styleUrl: './admin-menu.component.scss'
})
export class AdminMenuComponent {
  readonly menu: MenuItem[] = [
    { label: 'Streams', icon: 'mdi mdi-twitch', routerLink: '/admin/streams' }
  ]
}
