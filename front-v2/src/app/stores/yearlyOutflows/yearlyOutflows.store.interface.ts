import { InjectionToken, Signal } from '@angular/core';
import {
  MonthlySavings,
  YearlyOutflows,
} from '../../models/yearlyOutflow.model';

export interface YearlyOutflowsStoreInterface {
  getAll(): Signal<YearlyOutflows | null>;

  replaceAll(outflows: YearlyOutflows): void;

  getSavingsForMonth(month: number): Signal<MonthlySavings>;
}

export const YEARLY_OUTFLOWS_STORE =
  new InjectionToken<YearlyOutflowsStoreInterface>('YEARLY_OUTFLOWS_STORE');
