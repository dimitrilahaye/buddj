import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Budget,
  MonthCreationTemplate,
  Outflow,
} from '../../models/monthTemplate.model';

export type AddingBudget = Omit<Budget, 'id'>;
export type AddingOutflow = Omit<Outflow, 'id' | 'isChecked'>;

export default interface MonthTemplatesServiceInterface {
  getTemplate(): Observable<MonthCreationTemplate>;
  getAll(): Observable<void>;
  updateTemplate(
    templateId: string,
    data: { name: string; isDefault: boolean }
  ): Observable<void>;
  deleteOutflow(templateId: string, outflowId: string): Observable<void>;
  deleteBudget(templateId: string, budgetId: string): Observable<void>;
  addBudget(templateId: string, budget: AddingBudget): Observable<void>;
  addOutflow(templateId: string, budget: AddingOutflow): Observable<void>;
}

export const MONTH_TEMPLATES_SERVICE =
  new InjectionToken<MonthTemplatesServiceInterface>('MONTH_TEMPLATES_SERVICE');
