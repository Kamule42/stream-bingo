import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: 'auth', loadComponent: () =>  import('./views/auth/auth.component').then(c => c.AuthComponent)}
];
