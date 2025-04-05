import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', loadComponent: () =>  import('./views/main/home/home.component').then(c => c.HomeComponent)},
    {path: 'auth/redirect/discord', loadComponent: () =>  import('./views/auth/discord-redirect/discord-redirect.component').then(c => c.DiscordRedirectComponent)},
    {path: 's/:urlhandle', loadComponent: () =>  import('./views/stream/stream/stream.component').then(c => c.StreamComponent)},
];
