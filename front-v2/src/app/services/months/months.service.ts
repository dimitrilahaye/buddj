import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import MonthsServiceInterface, {
  AddExpense,
  AddOutflow,
  UpdateExpensesChecking,
  UpdateOutflowsChecking,
} from './months.service.interface';
import { map, Observable, tap } from 'rxjs';
import { Month } from '../../models/month.model';
import { Response } from '../../models/response.model';
import { MonthlyBudget } from '../../models/monthlyBudget.model';
import {
  MONTHLY_BUDGETS_STORE,
  MonthlyBudgetsStoreInterface,
} from '../../stores/monthlyBudgets.store.interface';

@Injectable({
  providedIn: 'root',
})
export class MonthsService implements MonthsServiceInterface {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(MONTHLY_BUDGETS_STORE)
    private monthlyBudgetsStore: MonthlyBudgetsStoreInterface
  ) {
    this.apiUrl = environment.apiUrl;
  }

  createMonth(month: Month): Observable<void> {
    return this.http
      .post<Response<MonthlyBudget>>(`${this.apiUrl}/months`, month)
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.addMonth(data)),
        map(() => void 0)
      );
  }

  getUnarchivedMonths(): Observable<void> {
    return this.http
      .get<Response<MonthlyBudget[]>>(`${this.apiUrl}/months/unarchived`)
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.addMonths(data)),
        map(() => void 0)
      );
  }

  deleteOutflow(monthId: string, outflowId: string): Observable<void> {
    return this.http
      .delete<Response<MonthlyBudget>>(
        `${this.apiUrl}/months/${monthId}/outflows/${outflowId}`
      )
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.replaceMonth(data)),
        map(() => void 0)
      );
  }

  addOutflow(monthId: string, outflow: AddOutflow): Observable<void> {
    return this.http
      .post<Response<MonthlyBudget>>(
        `${this.apiUrl}/months/${monthId}/outflows/`,
        outflow
      )
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.replaceMonth(data)),
        map(() => void 0)
      );
  }

  updateOutflowsChecking(
    monthId: string,
    data: UpdateOutflowsChecking
  ): Observable<void> {
    return this.http
      .put<Response<MonthlyBudget>>(
        `${this.apiUrl}/months/${monthId}/outflows/checking`,
        data
      )
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.replaceMonth(data)),
        map(() => void 0)
      );
  }

  updateExpensesChecking(
    monthId: string,
    data: UpdateExpensesChecking
  ): Observable<void> {
    return this.http
      .put<Response<MonthlyBudget>>(
        `${this.apiUrl}/months/${monthId}/expenses/checking`,
        data
      )
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.replaceMonth(data)),
        map(() => void 0)
      );
  }

  deleteExpense(
    monthId: string,
    weeklyId: string,
    expenseId: string
  ): Observable<void> {
    return this.http
      .delete<Response<MonthlyBudget>>(
        `${this.apiUrl}/months/${monthId}/weekly/${weeklyId}/expenses/${expenseId}`
      )
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.replaceMonth(data)),
        map(() => void 0)
      );
  }

  addExpense(
    monthId: string,
    weeklyId: string,
    expense: AddExpense
  ): Observable<void> {
    return this.http
      .post<Response<MonthlyBudget>>(
        `${this.apiUrl}/months/${monthId}/weeks/${weeklyId}/expenses`,
        expense
      )
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.replaceMonth(data)),
        map(() => void 0)
      );
  }

  getArchivedMonths(): Observable<MonthlyBudget[]> {
    return this.http
      .get<Response<MonthlyBudget[]>>(`${this.apiUrl}/months/archived`)
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.addArchivedMonths(data)),
        map(({ data }) => data)
      );
  }

  archiveMonth(monthId: string): Observable<void> {
    return this.http
      .put<Response<MonthlyBudget>>(
        `${this.apiUrl}/months/${monthId}/archive`,
        {}
      )
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.addMonthToArchives(data)),
        map(() => void 0)
      );
  }

  unarchiveMonth(monthId: string): Observable<void> {
    return this.http
      .put<Response<MonthlyBudget[]>>(
        `${this.apiUrl}/months/${monthId}/unarchive`,
        {}
      )
      .pipe(
        tap(() => this.monthlyBudgetsStore.removeMonthFromArchives(monthId)),
        map(() => void 0)
      );
  }

  deleteMonth(monthId: string): Observable<void> {
    return this.http
      .delete<Response<MonthlyBudget[]>>(`${this.apiUrl}/months/${monthId}`, {})
      .pipe(
        tap(() => this.monthlyBudgetsStore.removeMonthFromArchives(monthId)),
        tap(({ data }) => this.monthlyBudgetsStore.addMonths(data)),
        map(() => void 0)
      );
  }

  transferRemainingBalanceIntoMonth(
    monthId: string,
    amount: number,
    fromType: 'account' | 'weekly-budget',
    fromId: string,
    toType: 'account' | 'weekly-budget',
    toId: string
  ): Observable<void> {
    return this.http
      .put<Response<MonthlyBudget>>(
        `${this.apiUrl}/months/${monthId}/transfer/from/${fromType}/${fromId}/to/${toType}/${toId}`,
        { amount }
      )
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.replaceMonth(data)),
        map(() => void 0)
      );
  }
}
