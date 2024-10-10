import { Injectable, Signal, signal } from '@angular/core';
import { MonthlyBudgetsStoreInterface } from './monthlyBudgets.store.interface';
import { MonthlyBudget } from '../models/monthlyBudget.model';

@Injectable({
  providedIn: 'root',
})
export class MonthlyBudgetsStore implements MonthlyBudgetsStoreInterface {
  private _state = signal<MonthlyBudget[]>([]);

  addMonth(month: MonthlyBudget) {
    this._state.update((months) => {
      return [...months, month];
    });
  }

  getAll(): Signal<MonthlyBudget[]> {
    return this._state.asReadonly();
  }
}
