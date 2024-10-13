import {
  effect,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { MonthlyBudgetsStoreInterface } from './monthlyBudgets.store.interface';
import {
  Expense,
  MonthlyBudget,
  Outflow,
  WeeklyBudget,
} from '../models/monthlyBudget.model';

@Injectable({
  providedIn: 'root',
})
export class MonthlyBudgetsStore implements MonthlyBudgetsStoreInterface {
  private _all = signal<MonthlyBudget[]>([]);
  private _currentMonth = signal<MonthlyBudget | null>(null);
  private _isCurrentMonthTheFirst = signal<boolean>(false);
  private _isCurrentMonthTheLast = signal<boolean>(false);
  // outflows management
  private _currentOutflows = signal<Outflow[]>([]);
  private _askedForNewOutflow: WritableSignal<number> = signal(0);
  // expenses management
  private _currentExpenses = signal<Expense[]>([]);
  private _askedForNewExpense: WritableSignal<number> = signal(0);
  // archived months management
  private _allArchivedMonths = signal<MonthlyBudget[]>([]);

  constructor() {
    effect(
      () => {
        const allMonths = this._all();
        if (allMonths.length > 0) {
          this._currentMonth.set(allMonths[0]);
          this._currentOutflows.set(
            this.sortOutflowsByLabel(allMonths[0].account.outflows)
          );
          const currentExpenses = allMonths[0].account.weeklyBudgets.flatMap(
            (w) => {
              return w.expenses;
            }
          );
          this._currentExpenses.set(this.sortExpensesByLabel(currentExpenses));
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
          this._currentExpenses.set([]);
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
    this.setSortedExpenses(month.account.weeklyBudgets);
  }

  addMonth(month: MonthlyBudget) {
    this._all.update((months) => {
      return [...months, month].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });
  }

  addMonthToArchives(month: MonthlyBudget): void {
    this._allArchivedMonths.update((months) => {
      return [...months, month].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });
    this.removeMonthFromList(month);
  }

  removeMonthFromArchives(monthIdToRemove: string): void {
    const monthToRemoveFromArchives = this._allArchivedMonths().find(
      (m) => m.id === monthIdToRemove
    );
    this._allArchivedMonths.update((months) => {
      return [...months]
        .filter((m) => m.id !== monthIdToRemove)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    });
    if (monthToRemoveFromArchives) {
      this.addMonth(monthToRemoveFromArchives);
    }
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
      this.setSortedExpenses(nextMonth.account.weeklyBudgets);
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
      this.setSortedExpenses(previousMonth.account.weeklyBudgets);
    }

    return this.getCurrent();
  }

  addArchivedMonths(months: MonthlyBudget[]): void {
    this._allArchivedMonths.update(() => {
      return [...months].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });
  }

  getAllArchivedMonths(): Signal<MonthlyBudget[]> {
    return this._allArchivedMonths.asReadonly();
  }

  getCurrentOutflows(): Signal<Outflow[]> {
    return this._currentOutflows.asReadonly();
  }

  get askedForNewOutflow(): WritableSignal<number> {
    return this._askedForNewOutflow;
  }

  askForNewOutflow(): void {
    this._askedForNewOutflow.update((value) => value + 1);
  }

  resetAskForNewOutflow(): void {
    this._askedForNewOutflow.set(0);
  }

  getCurrentExpenses(): Signal<Outflow[]> {
    return this._currentExpenses.asReadonly();
  }

  get askedForNewExpense(): WritableSignal<number> {
    return this._askedForNewExpense;
  }

  askForNewExpense(): void {
    this._askedForNewExpense.update((value) => value + 1);
  }

  resetAskForNewExpense(): void {
    this._askedForNewExpense.set(0);
  }

  private removeMonthFromList(month: MonthlyBudget) {
    this._all.update((months) => {
      return [...months]
        .filter((m) => m.id !== month.id)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    });
  }

  private sortExpensesByLabel(expenses: Expense[]) {
    return expenses.sort((a, b) => {
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? 1 : -1;
      }
      return a.label.localeCompare(b.label);
    });
  }

  private setSortedExpenses(weeklyBudgets: WeeklyBudget[]) {
    const currentExpenses = weeklyBudgets.flatMap((w) => {
      return w.expenses;
    });
    this._currentExpenses.set(this.sortExpensesByLabel(currentExpenses));
  }

  private sortOutflowsByLabel(outflows: Outflow[]) {
    return outflows.sort((a, b) => {
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? 1 : -1;
      }
      return a.label.localeCompare(b.label);
    });
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
