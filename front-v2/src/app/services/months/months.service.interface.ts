import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Month } from '../../models/month.model';
import { MonthlyBudget } from '../../models/monthlyBudget.model';

export default interface MonthsServiceInterface {
  createMonth(month: Month): Observable<MonthlyBudget>;
}

export const MONTHS_SERVICE = new InjectionToken<MonthsServiceInterface>(
  'MONTHS_SERVICE'
);
