import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Month } from '../../models/month.model';
import { MonthlyBudget, Outflow } from '../../models/monthlyBudget.model';

export interface UpdateOutflowsChecking {
  currentBalance: number;
  outflows: Outflow[];
}

export interface AddOutflow {
  label: string;
  amount: number;
}

export interface AddExpense {
  label: string;
  amount: number;
}

export interface AddBudget {
  initialBalance: number;
  name: string;
}

export interface UpdateExpensesChecking {
  weeklyBudgets: {
    id: string;
    expenses: { id: string; isChecked: boolean }[];
  }[];
}

export default interface MonthsServiceInterface {
  createMonth(month: Month): Observable<void>;
  getUnarchivedMonths(): Observable<void>;
  deleteOutflow(monthId: string, outflowId: string): Observable<void>;
  updateOutflowsChecking(
    monthId: string,
    data: UpdateOutflowsChecking
  ): Observable<void>;
  addOutflow(monthId: string, outflow: AddOutflow): Observable<void>;
  addBudget(monthId: string, outflow: AddBudget): Observable<void>;
  updateExpensesChecking(
    monthId: string,
    data: UpdateExpensesChecking
  ): Observable<void>;
  deleteExpense(
    monthId: string,
    weeklyId: string,
    expenseId: string
  ): Observable<void>;
  addExpense(
    monthId: string,
    weeklyId: string,
    expense: AddExpense
  ): Observable<void>;
  updateBudget(
    monthId: string,
    budgetId: string,
    name: string
  ): Observable<void>;
  getArchivedMonths(): Observable<MonthlyBudget[]>;
  archiveMonth(monthId: string): Observable<void>;
  unarchiveMonth(monthId: string): Observable<void>;
  deleteMonth(monthId: string): Observable<void>;
  transferRemainingBalanceIntoMonth(
    monthId: string,
    amount: number,
    fromType: 'account' | 'weekly-budget',
    fromId: string,
    toType: 'account' | 'weekly-budget',
    toId: string
  ): Observable<void>;
}

export const MONTHS_SERVICE = new InjectionToken<MonthsServiceInterface>(
  'MONTHS_SERVICE'
);
