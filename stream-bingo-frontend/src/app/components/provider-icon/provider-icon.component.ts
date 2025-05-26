import { Component, inject, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar'
import { SessionService } from '../../services/session/session.service'

@Component({
  selector: 'app-provider-icon',
  imports: [AvatarModule],
  templateUrl: './provider-icon.component.html',
  styleUrl: './provider-icon.component.scss'
})
export class ProviderIconComponent {
  private readonly sessionService = inject(SessionService)

  public readonly avatar = input.required<{
    provider: string,
    avatarId: string,
    active: boolean,
  }>()
  public readonly size = input<'large' | 'xlarge' | 'normal'>('normal')
  readonly session = this.sessionService.session$
}
