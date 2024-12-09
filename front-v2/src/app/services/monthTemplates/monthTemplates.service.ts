import { Inject, Injectable } from '@angular/core';
import MonthTemplatesServiceInterface from './monthTemplates.service.interface';
import { map, Observable, tap } from 'rxjs';
import {
  MonthCreationTemplate,
  MonthTemplate,
} from '../../models/monthTemplate.model';
import { Response } from '../../models/response.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  MONTHLY_TEMPLATES_STORE,
  MonthlyTemplatesStoreInterface,
} from '../../stores/monthlyTemplates/monthlyTemplates.store.interface';

@Injectable({
  providedIn: 'root',
})
export class MonthTemplatesService implements MonthTemplatesServiceInterface {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(MONTHLY_TEMPLATES_STORE)
    private monthlyTemplatesStore: MonthlyTemplatesStoreInterface
  ) {
    this.apiUrl = environment.apiUrl;
  }

  getTemplate(): Observable<MonthCreationTemplate> {
    return this.http
      .get<Response<MonthCreationTemplate>>(
        `${this.apiUrl}/months/template/default`
      )
      .pipe(map(({ data }) => data));
  }

  getAll(): Observable<void> {
    return this.http
      .get<Response<MonthTemplate[]>>(`${this.apiUrl}/months/template`)
      .pipe(
        tap(({ data }) => this.monthlyTemplatesStore.addAll(data)),
        map(() => void 0)
      );
  }

  updateTemplate(
    templateId: string,
    data: { name: string; isDefault: boolean }
  ): Observable<void> {
    return this.http
      .patch<Response<MonthTemplate>>(
        `${this.apiUrl}/monthly-templates/${templateId}`,
        data
      )
      .pipe(
        tap(({ data }) => this.monthlyTemplatesStore.replaceOne(data)),
        map(() => void 0)
      );
  }

  deleteOutflow(templateId: string, outflowId: string): Observable<void> {
    return this.http
      .delete<Response<MonthTemplate>>(
        `${this.apiUrl}/monthly-templates/${templateId}/monthly-outflows/${outflowId}`
      )
      .pipe(
        tap(({ data }) => this.monthlyTemplatesStore.replaceOne(data)),
        map(() => void 0)
      );
  }

  deleteBudget(templateId: string, budgetId: string): Observable<void> {
    return this.http
      .delete<Response<MonthTemplate>>(
        `${this.apiUrl}/monthly-templates/${templateId}/monthly-budgets/${budgetId}`
      )
      .pipe(
        tap(({ data }) => this.monthlyTemplatesStore.replaceOne(data)),
        map(() => void 0)
      );
  }
}
