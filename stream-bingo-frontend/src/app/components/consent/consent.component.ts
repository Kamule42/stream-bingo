import { Component, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { tap } from 'rxjs'
import { RouterModule } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { ConsentService } from '../../services/consent/consent.service'

@Component({
  selector: 'app-consent',
  imports: [ RouterModule, ButtonModule ],
  templateUrl: './consent.component.html',
  styleUrl: './consent.component.scss'
})
export class ConsentComponent {
  private readonly consentService = inject(ConsentService)
  readonly show$ = signal<boolean>(false)
  readonly status$ = toSignal(
    this.consentService.status$.pipe(
      tap(status => this.show$.set(status === null))
    ),
    {initialValue: null})

  public consent(){
    this.consentService.consent()
  }
  public resetStatus(){
    this.consentService.resetStatus()
  }
}
