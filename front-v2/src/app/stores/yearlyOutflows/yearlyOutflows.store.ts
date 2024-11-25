import { Injectable, Signal, signal } from '@angular/core';
import {
  YearlyOutflow,
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

  getOutflowForMonth(month: number): Signal<YearlyOutflow[]> {
    if (this._all() === null) {
      return signal([]);
    }
    return signal(this._all()![month]);
  }
}
