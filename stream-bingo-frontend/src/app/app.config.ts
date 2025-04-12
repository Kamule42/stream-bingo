import { ApplicationConfig } from '@angular/core'
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { providePrimeNG } from 'primeng/config'
import Aura from '@primeng/themes/aura'
import { provideNgcCookieConsent } from 'ngx-cookieconsent'

import { routes } from './app.routes'
import { httpInterceptor } from './interceptors/http/http.interceptor'
import { cookieConfig } from './config/cookieconsent.config'
import { MessageService } from 'primeng/api'


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always'
      }),
      withComponentInputBinding()),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura
        }
    }),
    provideHttpClient(
      withInterceptors([httpInterceptor])
    ),
    provideNgcCookieConsent(cookieConfig),
    MessageService,
  ]
};
