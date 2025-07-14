import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core'
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { providePrimeNG } from 'primeng/config'

import { ConfirmationService, MessageService } from 'primeng/api'
import { routes } from './app.routes'
import { httpInterceptor } from './interceptors/http/http.interceptor'
import { primeNgConfig } from './config/primeng.config'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
      withComponentInputBinding()),
    provideAnimationsAsync(),
    providePrimeNG(primeNgConfig),
    provideHttpClient(
      withInterceptors([httpInterceptor])
    ),
    MessageService,
    ConfirmationService,
  ],
};
