import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: 'auth', loadComponent: () =>  import('./views/auth/auth/auth.component').then(c => c.AuthComponent)},
    {path: 'auth/redirect/discord', loadComponent: () =>  import('./views/auth/discord-redirect/discord-redirect.component').then(c => c.DiscordRedirectComponent)},
];
