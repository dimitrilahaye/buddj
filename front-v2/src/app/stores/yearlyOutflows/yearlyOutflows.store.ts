import { Injectable, Signal, signal } from '@angular/core';
import { YearlyOutflows } from '../../models/yearlyOutflow.model';
import { YearlyOutflowsStoreInterface } from './yearlyOutflows.store.interface';

@Injectable({
  providedIn: 'root',
})
export class YearlyOutflowsStore implements YearlyOutflowsStoreInterface {
  private _all = signal<YearlyOutflows | null>(null);

  getAll(): Signal<YearlyOutflows | null> {
    return this._all.asReadonly();
  }

  replaceAll(outflows: YearlyOutflows): void {
    this._all.update(() => {
      return outflows;
    });
  }
}
