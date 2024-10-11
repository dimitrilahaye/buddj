import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import MonthsServiceInterface from './months.service.interface';
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

  createMonth(month: Month): Observable<MonthlyBudget> {
    return this.http
      .post<Response<MonthlyBudget>>(`${this.apiUrl}/months`, month)
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.addMonth(data)),
        map(({ data }) => data)
      );
  }

  getUnarchivedMonths(): Observable<MonthlyBudget[]> {
    return this.http
      .get<Response<MonthlyBudget[]>>(`${this.apiUrl}/months/unarchived`)
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.addMonths(data)),
        map(({ data }) => data)
      );
  }

  deleteOutflow(monthId: string, outflowId: string): Observable<MonthlyBudget> {
    return this.http
      .delete<Response<MonthlyBudget>>(
        `${this.apiUrl}/months/${monthId}/outflows/${outflowId}`
      )
      .pipe(
        tap(({ data }) => this.monthlyBudgetsStore.replaceMonth(data)),
        map(({ data }) => data)
      );
  }
}
