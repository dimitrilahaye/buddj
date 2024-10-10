import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Month } from '../../models/month.model';

export default interface MonthsServiceInterface {
  createMonth(month: Month): Observable<Month[]>;
}

export const MONTHS_SERVICE_SERVICE =
  new InjectionToken<MonthsServiceInterface>('MONTHS_SERVICE_SERVICE');
