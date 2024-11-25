import { InjectionToken, Signal } from '@angular/core';
import {
  YearlyOutflow,
  YearlyOutflows,
} from '../../models/yearlyOutflow.model';

export interface YearlyOutflowsStoreInterface {
  getAll(): Signal<YearlyOutflows | null>;

  replaceAll(outflows: YearlyOutflows): void;

  getOutflowForMonth(month: number): Signal<YearlyOutflow[]>;
}

export const YEARLY_OUTFLOWS_STORE =
  new InjectionToken<YearlyOutflowsStoreInterface>('YEARLY_OUTFLOWS_STORE');
