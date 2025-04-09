import { Component, inject, } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { TopMenuComponent } from './components/top-menu/top-menu.component'
import { NgcCookieConsentService } from 'ngx-cookieconsent'
import { ToastModule } from 'primeng/toast'

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, TopMenuComponent, ToastModule ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent{
    private readonly ccSerice = inject(NgcCookieConsentService)
}
