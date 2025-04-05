import { Component, } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { TopMenuComponent } from './components/top-menu/top-menu.component'


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, TopMenuComponent, ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {

}
