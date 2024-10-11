import { effect, Injectable, Signal, signal } from '@angular/core';
import { MonthlyBudgetsStoreInterface } from './monthlyBudgets.store.interface';
import { MonthlyBudget, Outflow } from '../models/monthlyBudget.model';

@Injectable({
  providedIn: 'root',
})
export class MonthlyBudgetsStore implements MonthlyBudgetsStoreInterface {
  private _all = signal<MonthlyBudget[]>([]);
  private _currentMonth = signal<MonthlyBudget | null>(null);
  private _currentOutflows = signal<Outflow[]>([]);
  private _isCurrentMonthTheFirst = signal<boolean>(false);
  private _isCurrentMonthTheLast = signal<boolean>(false);

  constructor() {
    effect(
      () => {
        const allMonths = this._all();
        if (allMonths.length > 0) {
          this._currentMonth.set(allMonths[0]);
          this._currentOutflows.set(
            this.sortOutflowsByLabel(allMonths[0].account.outflows)
          );
          const currentMonthIndex = allMonths.findIndex(
            (m) => m.id === allMonths[0].id
          );
          this._isCurrentMonthTheFirst.set(currentMonthIndex === 0);
          this._isCurrentMonthTheLast.set(
            currentMonthIndex === allMonths.length - 1
          );
        } else {
          this._currentMonth.set(null);
          this._currentOutflows.set([]);
        }
      },
      { allowSignalWrites: true }
    );
  }

  replaceMonth(month: MonthlyBudget): void {
    this.setCurrentMonth(month);
    this._all.update((months) => {
      const monthToReplaceIndex = months.findIndex((m) => m.id === month.id);
      months[monthToReplaceIndex] = month;
      return months;
    });
    this.setSortedOutflows(month.account.outflows);
  }

  addMonth(month: MonthlyBudget) {
    this._all.update((months) => {
      return [...months, month];
    });
  }

  addMonths(months: MonthlyBudget[]): void {
    this._all.update(() => {
      return [...months].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });
  }

  getAll(): Signal<MonthlyBudget[]> {
    return this._all.asReadonly();
  }

  getCurrent(): Signal<MonthlyBudget | null> {
    return this._currentMonth.asReadonly();
  }

  getCurrentOutflows(): Signal<Outflow[]> {
    return this._currentOutflows.asReadonly();
  }

  isCurrentMonthTheFirst(): Signal<boolean> {
    return this._isCurrentMonthTheFirst;
  }

  isCurrentMonthTheLast(): Signal<boolean> {
    return this._isCurrentMonthTheLast;
  }

  setNextMonth(): Signal<MonthlyBudget | null> {
    const allMonths = this._all();
    const currentMonth = this._currentMonth();

    const currentIndex = allMonths.findIndex((month) => month === currentMonth);

    if (currentIndex >= 0 && currentIndex < allMonths.length - 1) {
      const nextMonth = allMonths[currentIndex + 1];
      this.setCurrentMonth(nextMonth);
      this.setSortedOutflows(nextMonth.account.outflows);
    }

    return this.getCurrent();
  }

  setPreviousMonth(): Signal<MonthlyBudget | null> {
    const allMonths = this._all();
    const currentMonth = this._currentMonth();

    const currentIndex = allMonths.findIndex((month) => month === currentMonth);

    if (currentIndex > 0) {
      const previousMonth = allMonths[currentIndex - 1];
      this.setCurrentMonth(previousMonth);
      this.setSortedOutflows(previousMonth.account.outflows);
    }

    return this.getCurrent();
  }

  private sortOutflowsByLabel(outflows: Outflow[]) {
    return outflows.sort((a, b) => a.label.localeCompare(b.label));
  }

  private setSortedOutflows(outflows: Outflow[]) {
    this._currentOutflows.set(this.sortOutflowsByLabel(outflows));
  }

  private setCurrentMonth(month: MonthlyBudget) {
    this._currentMonth.set(month);
    this.setIsCurrentMonthTheFirst();
    this.setIsCurrentMonthTheLast();
  }

  private setIsCurrentMonthTheFirst() {
    const all = this.getAll()();
    const currentMonth = this.getCurrent()();
    const currentMonthIndex = all.findIndex((m) => m.id === currentMonth?.id);
    this._isCurrentMonthTheFirst.set(currentMonthIndex === 0);
  }

  private setIsCurrentMonthTheLast() {
    const all = this.getAll()();
    const currentMonth = this.getCurrent()();
    const currentMonthIndex = all.findIndex((m) => m.id === currentMonth?.id);
    this._isCurrentMonthTheLast.set(currentMonthIndex === all.length - 1);
  }
}
