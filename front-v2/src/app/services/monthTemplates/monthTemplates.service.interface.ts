import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MonthCreationTemplate } from '../../models/monthTemplate.model';

export default interface MonthTemplatesServiceInterface {
  getTemplate(): Observable<MonthCreationTemplate>;
}

export const MONTH_TEMPLATES_SERVICE =
  new InjectionToken<MonthTemplatesServiceInterface>('MONTH_TEMPLATES_SERVICE');
