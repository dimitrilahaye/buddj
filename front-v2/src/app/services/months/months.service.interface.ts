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

export interface UpdateExpensesChecking {
  weeklyBudgets: {
    id: string;
    expenses: { id: string; isChecked: boolean }[];
  }[];
}

export default interface MonthsServiceInterface {
  createMonth(month: Month): Observable<MonthlyBudget>;
  getUnarchivedMonths(): Observable<MonthlyBudget[]>;
  deleteOutflow(monthId: string, outflowId: string): Observable<MonthlyBudget>;
  updateOutflowsChecking(
    monthId: string,
    data: UpdateOutflowsChecking
  ): Observable<MonthlyBudget>;
  addOutflow(monthId: string, outflow: AddOutflow): Observable<MonthlyBudget>;
  updateExpensesChecking(
    monthId: string,
    data: UpdateExpensesChecking
  ): Observable<MonthlyBudget>;
  deleteExpense(
    monthId: string,
    weeklyId: string,
    expenseId: string
  ): Observable<MonthlyBudget>;
  addExpense(
    monthId: string,
    weeklyId: string,
    expense: AddExpense
  ): Observable<MonthlyBudget>;
  getArchivedMonths(): Observable<MonthlyBudget[]>;
  archiveMonth(monthId: string): Observable<MonthlyBudget>;
  unarchiveMonth(monthId: string): Observable<MonthlyBudget[]>;
  deleteMonth(monthId: string): Observable<MonthlyBudget[]>;
}

export const MONTHS_SERVICE = new InjectionToken<MonthsServiceInterface>(
  'MONTHS_SERVICE'
);
