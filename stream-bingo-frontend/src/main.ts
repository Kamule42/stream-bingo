import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'
import { appConfig } from './app/app.config'

import 'unicode-emoji-picker'

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
