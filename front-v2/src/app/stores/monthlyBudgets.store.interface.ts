import { InjectionToken, Signal, WritableSignal } from '@angular/core';
import { MonthlyBudget, Outflow } from '../models/monthlyBudget.model';

export interface MonthlyBudgetsStoreInterface {
  addMonth(month: MonthlyBudget): void;

  replaceMonth(month: MonthlyBudget): void;

  addMonths(months: MonthlyBudget[]): void;

  getAll(): Signal<MonthlyBudget[]>;

  getCurrent(): Signal<MonthlyBudget | null>;

  getCurrentOutflows(): Signal<Outflow[] | null>;

  setNextMonth(): Signal<MonthlyBudget | null>;

  setPreviousMonth(): Signal<MonthlyBudget | null>;

  isCurrentMonthTheFirst(): Signal<boolean>;

  isCurrentMonthTheLast(): Signal<boolean>;

  get askedForNewOutflow(): WritableSignal<number>;

  askForNewOutflow(): void;
}

export const MONTHLY_BUDGETS_STORE =
  new InjectionToken<MonthlyBudgetsStoreInterface>('MONTHLY_BUDGETS_STORE');
