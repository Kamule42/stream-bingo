import { Component, signal } from '@angular/core'
import { MenuItem } from 'primeng/api'
import { MenuModule } from 'primeng/menu'
import { IStream } from '../../../services/streams/stream.interface'

@Component({
  selector: 'app-admin-menu',
  imports: [MenuModule, ],
  templateUrl: './admin-menu.component.html',
  styleUrl: './admin-menu.component.scss'
})
export class AdminMenuComponent {
  readonly menu: Array<MenuItem> = [
    { label: 'Streams', icon: 'mdi mdi-twitch', routerLink: '/admin/streams' }
  ]
}
