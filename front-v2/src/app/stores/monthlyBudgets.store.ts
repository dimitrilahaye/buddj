import { effect, Injectable, Signal, signal } from '@angular/core';
import { MonthlyBudgetsStoreInterface } from './monthlyBudgets.store.interface';
import { MonthlyBudget } from '../models/monthlyBudget.model';

@Injectable({
  providedIn: 'root',
})
export class MonthlyBudgetsStore implements MonthlyBudgetsStoreInterface {
  private _all = signal<MonthlyBudget[]>([]);
  private _current = signal<MonthlyBudget | null>(null);

  constructor() {
    effect(
      () => {
        const allMonths = this._all();
        if (allMonths.length > 0) {
          this._current.set(allMonths[0]);
        } else {
          this._current.set(null);
        }
      },
      { allowSignalWrites: true }
    );
  }

  addMonth(month: MonthlyBudget) {
    this._all.update((months) => {
      return [...months, month];
    });
  }

  addMonths(months: MonthlyBudget[]): void {
    this._all.update(() => {
      return [...months];
    });
  }

  getAll(): Signal<MonthlyBudget[]> {
    return this._all.asReadonly();
  }

  getCurrent(): Signal<MonthlyBudget | null> {
    return this._current.asReadonly();
  }

  setNextMonth(): Signal<MonthlyBudget | null> {
    const allMonths = this._all();
    const currentMonth = this._current();

    const currentIndex = allMonths.findIndex((month) => month === currentMonth);

    if (currentIndex >= 0 && currentIndex < allMonths.length - 1) {
      const nextMonth = allMonths[currentIndex + 1];
      this._current.set(nextMonth);
    }

    return this.getCurrent();
  }

  setPreviousMonth(): Signal<MonthlyBudget | null> {
    const allMonths = this._all();
    const currentMonth = this._current();

    const currentIndex = allMonths.findIndex((month) => month === currentMonth);

    if (currentIndex > 0) {
      const previousMonth = allMonths[currentIndex - 1];
      this._current.set(previousMonth);
    }

    return this.getCurrent();
  }
}
