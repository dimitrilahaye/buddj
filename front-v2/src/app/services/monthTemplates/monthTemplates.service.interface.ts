import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MonthCreationTemplate } from '../../models/monthTemplate.model';

export default interface MonthTemplatesServiceInterface {
  getTemplate(): Observable<MonthCreationTemplate>;
  getAll(): Observable<void>;
  updateTemplate(
    templateId: string,
    data: { name: string; isDefault: boolean }
  ): Observable<void>;
  deleteOutflow(templateId: string, outflowId: string): Observable<void>;
  deleteBudget(templateId: string, budgetId: string): Observable<void>;
}

export const MONTH_TEMPLATES_SERVICE =
  new InjectionToken<MonthTemplatesServiceInterface>('MONTH_TEMPLATES_SERVICE');
