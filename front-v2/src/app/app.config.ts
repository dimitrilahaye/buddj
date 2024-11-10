import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthenticationService } from './services/authentication/authentication.service';
import { BrowserModule } from '@angular/platform-browser';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { AUTHENTICATION_SERVICE } from './services/authentication/authentication.service.interface';
import { MonthTemplatesService } from './services/monthTemplates/monthTemplates.service';
import { MONTH_TEMPLATES_SERVICE } from './services/monthTemplates/monthTemplates.service.interface';
import { httpRequestsInterceptor } from './interceptors/http-requests.interceptor';
import { MonthsService } from './services/months/months.service';
import { MONTHS_SERVICE } from './services/months/months.service.interface';
import { MonthlyBudgetsStore } from './stores/monthlyBudgets.store';
import { MONTHLY_BUDGETS_STORE } from './stores/monthlyBudgets.store.interface';
import { TOASTER_SERVICE } from './services/toaster.service.interface';
import { ToasterService } from './services/toaster.service';

registerLocaleData(localeFr);

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
    provideHotToastConfig({
      position: 'top-center',
      autoClose: true,
      dismissible: true,
    }),
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: AUTHENTICATION_SERVICE, useClass: AuthenticationService },
    {
      provide: MONTH_TEMPLATES_SERVICE,
      useClass: MonthTemplatesService,
    },
    {
      provide: MONTHS_SERVICE,
      useClass: MonthsService,
    },
    {
      provide: MONTHLY_BUDGETS_STORE,
      useClass: MonthlyBudgetsStore,
    },
    {
      provide: TOASTER_SERVICE,
      useClass: ToasterService,
    },
  ],
};
