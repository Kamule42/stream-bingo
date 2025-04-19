import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../../services/session/session.service';

@Component({
  selector: 'app-favs',
  imports: [ RouterLink ],
  templateUrl: './favs.component.html',
  styleUrl: './favs.component.scss'
})
export class FavsComponent {
  private readonly sessionService = inject(SessionService)
  readonly favs$ = this.sessionService.favs
}
