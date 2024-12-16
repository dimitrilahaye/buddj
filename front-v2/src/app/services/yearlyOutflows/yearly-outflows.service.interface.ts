import { InjectionToken } from '@angular/core';
import { YearlyBudget, YearlyOutflow } from '../../models/yearlyOutflow.model';
import { Observable } from 'rxjs';

export function getSavingDto(saving: YearlyOutflow | YearlyBudget) {
  if (saving.type === 'outflow') {
    return saving;
  }
  if (saving.type === 'budget') {
    return {
      id: saving.id,
      month: saving.month,
      label: saving.name,
      amount: saving.initialBalance,
      type: 'budget',
    };
  }
  throw new Error(`Type unknown`);
}

export default interface YearlyOutflowsServiceInterface {
  getAll(): Observable<void>;
  add(saving: YearlyOutflow | YearlyBudget): Observable<void>;
  remove(id: string): Observable<void>;
}

export const YEARLY_OUTFLOWS_SERVICE =
  new InjectionToken<YearlyOutflowsServiceInterface>('YEARLY_OUTFLOWS_SERVICE');
