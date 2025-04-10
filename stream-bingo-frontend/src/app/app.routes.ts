import { Routes } from '@angular/router';
import { hasRightGuard } from './guards/has-right.guard';

export const routes: Routes = [
    {path: '', loadComponent: () =>  import('./views/main/home/home.component').then(c => c.HomeComponent)},
    {path: 'auth/redirect/discord', loadComponent: () =>  import('./views/auth/discord-redirect/discord-redirect.component').then(c => c.DiscordRedirectComponent)},
    {path: 's/:webhandle', loadComponent: () =>  import('./views/stream/stream/stream.component').then(c => c.StreamComponent)},

    // @Me

    {
        path: '@me',
        canActivate: [hasRightGuard],
        children: [
            {path: 'favs', loadComponent: () => import('./views/@me/favs/favs.component').then(c => c.FavsComponent)}
        ]
    },

    // Admin
    {
        path: 'admin',
        loadComponent: () => import('./views/admin/main/main.component').then(c => c.MainComponent),
        canActivate: [hasRightGuard],
        data: {
            rights: ['a'],
        },
        children:[
            {path: 'streams', loadComponent: () => import('./views/admin/streams/streams.component').then(c => c.StreamsComponent)}
        ]
    }
];
