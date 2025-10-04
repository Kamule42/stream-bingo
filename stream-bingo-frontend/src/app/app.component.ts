import { Component, HostListener, inject,  } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { ToastModule } from 'primeng/toast'
import { TopMenuComponent } from './components/top-menu/top-menu.component'
import { ConsentComponent } from './components/consent/consent.component'
import { VisibilityService } from './services/visibility/visibility.service'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { AuthWsService } from './services/auth/auth-ws.service'
import { SessionWatcherComponent } from "./components/session-watcher/session-watcher.component";


@Component({
    selector: 'app-root',
    imports: [
      RouterOutlet, TopMenuComponent, ToastModule,
      ConsentComponent, ConfirmDialogModule, SessionWatcherComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
  //Not used but need for initialisation
  private readonly authWsService = inject(AuthWsService)
  private readonly visibilityService = inject(VisibilityService)

  @HostListener('document:visibilitychange', ['$event'])
  visibilitychange() {
    this.visibilityService.isVisible$ = !document.hidden
  }
}
