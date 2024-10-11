import { InjectionToken, Signal } from '@angular/core';
import { MonthlyBudget } from '../models/monthlyBudget.model';

export interface MonthlyBudgetsStoreInterface {
  addMonth(month: MonthlyBudget): void;

  addMonths(months: MonthlyBudget[]): void;

  getAll(): Signal<MonthlyBudget[]>;
}

export const MONTHLY_BUDGETS_STORE =
  new InjectionToken<MonthlyBudgetsStoreInterface>('MONTHLY_BUDGETS_STORE');
