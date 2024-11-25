import { InjectionToken } from '@angular/core';
import { YearlyOutflow } from '../../models/yearlyOutflow.model';
import { Observable } from 'rxjs';

export default interface YearlyOutflowsServiceInterface {
  getAll(): Observable<void>;
  add(outflow: YearlyOutflow): Observable<void>;
  remove(id: string): Observable<void>;
}

export const YEARLY_OUTFLOWS_SERVICE =
  new InjectionToken<YearlyOutflowsServiceInterface>('YEARLY_OUTFLOWS_SERVICE');
