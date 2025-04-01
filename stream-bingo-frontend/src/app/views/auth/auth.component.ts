import { HttpClient } from '@angular/common/http';
import { Component, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-auth',
  imports:  [ButtonModule,],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  discordUrl: WritableSignal<string | undefined> = signal(undefined)

  constructor(
    private readonly router: Router,
    readonly http: HttpClient){
    http.get<{url: string}>('/api/auth/discord-url')
    .subscribe({
      next: ({url}) => this.discordUrl.set(url),
      error: (error) => console.error(error),
    })
  }

  onAuth(): void{
    const url = this.discordUrl()
    if(!url){
      //TODO display error 
      return
    }
    window.location.href = url
  }
}
