import { Component, HostListener, inject, } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { TopMenuComponent } from './components/top-menu/top-menu.component'
import { ToastModule } from 'primeng/toast'
import { ConsentComponent } from './components/consent/consent.component'
import { VisibilityService } from './services/visibility/visibility.service'

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, TopMenuComponent, ToastModule, ConsentComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly visibilityService = inject(VisibilityService)

    @HostListener('document:visibilitychange', ['$event'])
    visibilitychange() {
      this.visibilityService.isVisible$ = !document.hidden
    }
}
