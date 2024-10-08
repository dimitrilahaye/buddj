import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthenticationService } from './services/authentication/authentication.service';
import { BrowserModule } from '@angular/platform-browser';
import { AUTHENTICATION_SERVICE } from './services/authentication/authentication.service.interface';
import { MonthTemplatesService } from './services/monthTemplates/monthTemplates.service';
import { MONTH_TEMPLATES_SERVICE_SERVICE } from './services/monthTemplates/monthTemplates.service.interface';
import { httpRequestsInterceptor } from './interceptors/http-requests.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    BrowserModule,
    ReactiveFormsModule,
    provideHttpClient(withInterceptors([httpRequestsInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: AUTHENTICATION_SERVICE, useClass: AuthenticationService },
    {
      provide: MONTH_TEMPLATES_SERVICE_SERVICE,
      useClass: MonthTemplatesService,
    },
  ],
};
