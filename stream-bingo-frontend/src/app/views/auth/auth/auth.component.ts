import { Component } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'

@Component({
  selector: 'app-auth',
  imports: [CardModule, ButtonModule, ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  readonly providers = ['discord', 'google']

  formatLabel(provider: string): string{
    return provider.charAt(0).toLocaleUpperCase() + provider.slice(1)
  }
}
