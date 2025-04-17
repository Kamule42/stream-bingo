import { Component, } from '@angular/core'
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-discord-auth',
  imports:  [ ButtonModule, ],
  templateUrl: './discord-auth.component.html',
  styleUrl: './discord-auth.component.scss'
})
export class DiscordAuthComponent {

}
