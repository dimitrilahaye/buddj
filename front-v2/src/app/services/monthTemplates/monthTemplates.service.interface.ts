import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MonthTemplate } from '../../models/monthTemplate.model';

export default interface MonthTemplatesServiceInterface {
  getTemplate(): Observable<MonthTemplate>;
}

export const MONTH_TEMPLATES_SERVICE_SERVICE =
  new InjectionToken<MonthTemplatesServiceInterface>(
    'MONTH_TEMPLATES_SERVICE_SERVICE'
  );
