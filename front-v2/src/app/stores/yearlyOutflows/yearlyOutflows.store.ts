import { Injectable, Signal, signal } from '@angular/core';
import {
  MonthlySavings,
  YearlyOutflows,
} from '../../models/yearlyOutflow.model';
import { YearlyOutflowsStoreInterface } from './yearlyOutflows.store.interface';

@Injectable({
  providedIn: 'root',
})
export class YearlyOutflowsStore implements YearlyOutflowsStoreInterface {
  private readonly _all = signal<YearlyOutflows | null>(null);

  getAll(): Signal<YearlyOutflows | null> {
    return this._all.asReadonly();
  }

  replaceAll(outflows: YearlyOutflows): void {
    this._all.update(() => {
      return outflows;
    });
  }

  getSavingsForMonth(month: number): Signal<MonthlySavings> {
    if (this._all() === null) {
      return signal({
        budgets: [],
        outflows: [],
      });
    }
    return signal(this._all()![month]);
  }
}
