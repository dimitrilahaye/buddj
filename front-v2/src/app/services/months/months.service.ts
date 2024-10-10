import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import MonthsServiceInterface from './months.service.interface';
import { map, Observable } from 'rxjs';
import { Month } from '../../models/month.model';
import { Response } from '../../models/response.model';
import { MonthlyBudget } from '../../models/monthlyBudget.model';

@Injectable({
  providedIn: 'root',
})
export class MonthsService implements MonthsServiceInterface {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  createMonth(month: Month): Observable<MonthlyBudget> {
    return this.http
      .post<Response<MonthlyBudget>>(`${this.apiUrl}/months`, month)
      .pipe(map(({ data }) => data));
  }
}
