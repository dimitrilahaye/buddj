import { InjectionToken, Signal, WritableSignal } from '@angular/core';
import { Expense, MonthlyBudget, Outflow } from '../models/monthlyBudget.model';

export interface MonthlyBudgetsStoreInterface {
  addMonth(month: MonthlyBudget): void;

  replaceMonth(month: MonthlyBudget): void;

  addMonths(months: MonthlyBudget[]): void;

  addArchivedMonths(months: MonthlyBudget[]): void;

  getAll(): Signal<MonthlyBudget[]>;

  getAllArchivedMonths(): Signal<MonthlyBudget[]>;

  addMonthToArchives(month: MonthlyBudget): void;

  removeMonthFromArchives(monthIdToRemove: string): void;

  getCurrent(): Signal<MonthlyBudget | null>;

  getCurrentOutflows(): Signal<Outflow[] | null>;

  setNextMonth(): Signal<MonthlyBudget | null>;

  setPreviousMonth(): Signal<MonthlyBudget | null>;

  isCurrentMonthTheFirst(): Signal<boolean>;

  isCurrentMonthTheLast(): Signal<boolean>;

  get askedForNewOutflow(): WritableSignal<number>;

  askForNewOutflow(): void;

  resetAskForNewOutflow(): void;

  getCurrentExpenses(): Signal<Expense[] | null>;

  get askedForNewExpense(): WritableSignal<number>;

  askForNewExpense(): void;

  resetAskForNewExpense(): void;

  get askedForTransferModalClose(): WritableSignal<number>;

  askForTransferModalClose(): void;

  resetAskForTransferModalClose(): void;
}

export const MONTHLY_BUDGETS_STORE =
  new InjectionToken<MonthlyBudgetsStoreInterface>('MONTHLY_BUDGETS_STORE');
