import { InjectionToken, Signal } from '@angular/core';
import { YearlyOutflows } from '../../models/yearlyOutflow.model';

export interface YearlyOutflowsStoreInterface {
  getAll(): Signal<YearlyOutflows | null>;

  replaceAll(outflows: YearlyOutflows): void;
}

export const YEARLY_OUTFLOWS_STORE =
  new InjectionToken<YearlyOutflowsStoreInterface>('YEARLY_OUTFLOWS_STORE');
