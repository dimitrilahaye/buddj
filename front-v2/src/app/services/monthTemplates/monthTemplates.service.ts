import { Injectable } from '@angular/core';
import MonthTemplatesServiceInterface from './monthTemplates.service.interface';
import { map, Observable } from 'rxjs';
import { MonthTemplate } from '../../models/monthTemplate.model';
import { Response } from '../../models/response.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MonthTemplatesService implements MonthTemplatesServiceInterface {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  getTemplate(): Observable<MonthTemplate> {
    return this.http
      .get<Response<MonthTemplate>>(`${this.apiUrl}/months/template`)
      .pipe(map(({ data }) => data));
  }
}
