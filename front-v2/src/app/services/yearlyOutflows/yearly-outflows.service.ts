import { Inject, Injectable } from '@angular/core';
import YearlyOutflowsServiceInterface from './yearly-outflows.service.interface';
import {
  YearlyBudget,
  YearlyOutflow,
  YearlyOutflows,
} from '../../models/yearlyOutflow.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Response } from '../../models/response.model';
import { map, Observable, tap } from 'rxjs';
import {
  YEARLY_OUTFLOWS_STORE,
  YearlyOutflowsStoreInterface,
} from '../../stores/yearlyOutflows/yearlyOutflows.store.interface';

@Injectable({
  providedIn: 'root',
})
export class YearlyOutflowsService implements YearlyOutflowsServiceInterface {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(YEARLY_OUTFLOWS_STORE)
    private readonly yearlyOutflowsStore: YearlyOutflowsStoreInterface
  ) {
    this.apiUrl = environment.apiUrl;
  }

  getAll(): Observable<void> {
    return this.http
      .get<Response<YearlyOutflows>>(`${this.apiUrl}/yearly-outflows`)
      .pipe(
        tap(({ data }) => this.yearlyOutflowsStore.replaceAll(data)),
        map(() => void 0)
      );
  }

  add(saving: YearlyOutflow | YearlyBudget): Observable<void> {
    return this.http
      .post<Response<YearlyOutflows>>(`${this.apiUrl}/yearly-outflows`, saving)
      .pipe(
        tap(({ data }) => this.yearlyOutflowsStore.replaceAll(data)),
        map(() => void 0)
      );
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<Response<YearlyOutflows>>(`${this.apiUrl}/yearly-outflows/${id}`)
      .pipe(
        tap(({ data }) => this.yearlyOutflowsStore.replaceAll(data)),
        map(() => void 0)
      );
  }
}
