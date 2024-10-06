import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from './services/authentication/authentication.service';
import { BrowserModule } from '@angular/platform-browser';
import { AUTHENTICATION_SERVICE } from './services/authentication/authentication.interface';

export const appConfig: ApplicationConfig = {
  providers: [
    BrowserModule,
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: AUTHENTICATION_SERVICE, useClass: AuthenticationService },
    CookieService,
  ],
};
