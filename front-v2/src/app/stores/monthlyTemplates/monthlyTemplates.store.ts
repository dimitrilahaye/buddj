import { Injectable, Signal, signal } from '@angular/core';
import { MonthlyTemplatesStoreInterface } from './monthlyTemplates.store.interface';
import { MonthTemplate } from '../../models/monthTemplate.model';

@Injectable({
  providedIn: 'root',
})
export class MonthlyTemplatesStore implements MonthlyTemplatesStoreInterface {
  private readonly _all = signal<MonthTemplate[]>([]);

  getAll(): Signal<MonthTemplate[]> {
    return this._all.asReadonly();
  }

  addAll(outflows: MonthTemplate[]): void {
    this._all.update(() => {
      return outflows;
    });
  }
}
