import { Routes } from '@angular/router'
import { hasRightGuard } from './guards/has-right.guard'

export const routes: Routes = [
  { path: '', loadComponent: () => import('./views/main/home/home.component').then(c => c.HomeComponent) },

  // General
  { path: 'cgu', loadComponent: () => import('./views/cgu/cgu.component').then(c => c.CGUComponent) },


  // Auth
  { path: 'auth/redirect/discord', loadComponent: () => import('./views/auth/discord-redirect/discord-redirect.component').then(c => c.DiscordRedirectComponent) },

  // Stream
  {
    path: 's/:webhandle',
    loadComponent: () => import('./views/stream/stream/stream.component').then(c => c.StreamComponent),
    children: [
      {
        path: 'b/:bingoId', loadComponent: () => import('./views/stream/view-stream/view-stream.component').then(c => c.ViewStreamComponent),
        data: {
          name: 'bingo'
        },
      },
      {
        path: '', loadComponent: () => import('./views/stream/view-stream/view-stream.component').then(c => c.ViewStreamComponent),
        data: {
          name: 'bingo'
        },
      },
      {
        path: 'edit',
        loadComponent: () => import('./views/stream/edit-stream/edit-stream.component').then(c => c.EditStreamComponent),
        data: {
          name: 'edit'
        },
      },
      {
        path: 'plan',
        loadComponent: () => import('./views/stream/plan-stream/plan-stream.component').then(c => c.PlanStreamComponent),
        data: {
          name: 'plan'
        },
      },
      {
        path: 'leaderboard',
        loadComponent: () => import('./views/stream/leaderboard/leaderboard.component').then(c => c.LeaderboardComponent),
        data: {
          name: 'leaderboard'
        }
      }
    ]
  },

  // @Me
  {
    path: '@me',
    canActivate: [hasRightGuard],
    children: [
      { path: '', loadComponent: () => import('./views/@me/profile/profile.component').then(c => c.ProfileComponent) },
      { path: 'favs', loadComponent: () => import('./views/@me/favs/favs.component').then(c => c.FavsComponent) },
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
    children: [
      { path: 'streams', loadComponent: () => import('./views/admin/streams/streams.component').then(c => c.StreamsComponent) },
      { path: '', redirectTo: 'streams', pathMatch: 'full', },
    ]
  }
]
