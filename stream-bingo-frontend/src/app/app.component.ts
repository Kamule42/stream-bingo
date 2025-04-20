import { Component, HostListener, inject, } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { ToastModule } from 'primeng/toast'
import { TopMenuComponent } from './components/top-menu/top-menu.component'
import { ConsentComponent } from './components/consent/consent.component'
import { VisibilityService } from './services/visibility/visibility.service'
import { AuthWsService } from './services/auth/auth-ws.service'
import { ConfirmDialogModule } from 'primeng/confirmdialog'

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, TopMenuComponent, ToastModule, ConsentComponent, ConfirmDialogModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly authWsService = inject(AuthWsService)
  private readonly visibilityService = inject(VisibilityService)

  @HostListener('document:visibilitychange', ['$event'])
  visibilitychange() {
    this.visibilityService.isVisible$ = !document.hidden
  }
}
