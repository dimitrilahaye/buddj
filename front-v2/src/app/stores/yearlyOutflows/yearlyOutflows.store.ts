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
      const savings = {
        1: {
          budgets: [],
          outflows: [],
        },
        2: {
          budgets: [],
          outflows: [],
        },
        3: {
          budgets: [],
          outflows: [],
        },
        4: {
          budgets: [],
          outflows: [],
        },
        5: {
          budgets: [],
          outflows: [],
        },
        6: {
          budgets: [],
          outflows: [],
        },
        7: {
          budgets: [],
          outflows: [],
        },
        8: {
          budgets: [],
          outflows: [],
        },
        9: {
          budgets: [],
          outflows: [],
        },
        10: {
          budgets: [],
          outflows: [],
        },
        11: {
          budgets: [],
          outflows: [],
        },
        12: {
          budgets: [],
          outflows: [],
        },
      };
      return signal((savings as YearlyOutflows)[month]);
    }
    return signal(this._all()![month]);
  }
}
