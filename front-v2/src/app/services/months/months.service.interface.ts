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

export default interface MonthsServiceInterface {
  createMonth(month: Month): Observable<MonthlyBudget>;
  getUnarchivedMonths(): Observable<MonthlyBudget[]>;
  deleteOutflow(monthId: string, outflowId: string): Observable<MonthlyBudget>;
  updateOutflowsChecking(
    monthId: string,
    data: UpdateOutflowsChecking
  ): Observable<MonthlyBudget>;
  addOutflow(monthId: string, outflow: AddOutflow): Observable<MonthlyBudget>;
}

export const MONTHS_SERVICE = new InjectionToken<MonthsServiceInterface>(
  'MONTHS_SERVICE'
);
