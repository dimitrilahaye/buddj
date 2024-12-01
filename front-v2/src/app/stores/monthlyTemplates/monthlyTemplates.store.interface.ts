import { InjectionToken, Signal } from '@angular/core';
import { MonthTemplate } from '../../models/monthTemplate.model';

export interface MonthlyTemplatesStoreInterface {
  getAll(): Signal<MonthTemplate[]>;
  addAll(outflows: MonthTemplate[]): void;
  getById(id: string): Signal<MonthTemplate | null>;
}

export const MONTHLY_TEMPLATES_STORE =
  new InjectionToken<MonthlyTemplatesStoreInterface>('MONTHLY_TEMPLATES_STORE');
