import { Store } from '../store.js';
import {
  applyExpenseToggleToMonthView,
  buildExpensesCheckingPayload,
} from './expenses-checking-payload.js';
import { DEFAULT_MONTH_STATE, getCurrentMonth, type MonthState } from './month-state.js';
import type { LoadUnarchivedMonthsUseCase } from './load-unarchived-months.js';
import type { PutExpensesCheckingUseCase } from './put-expenses-checking.js';
import type { MonthView } from './month-view.js';

export const LOADING_EXPENSES_CHECKING_TEXT = 'Mise à jour des dépenses en cours';

export type PutExpensesCheckingActionDetail = {
  weeklyBudgetId: string;
  expenseId: string;
  isChecked: boolean;
};

export class MonthStore extends Store<MonthState> {
  constructor({
    loadUnarchivedMonths,
    putExpensesChecking,
  }: {
    loadUnarchivedMonths: LoadUnarchivedMonthsUseCase;
    putExpensesChecking: PutExpensesCheckingUseCase;
  }) {
    super(DEFAULT_MONTH_STATE);
    this._loadUnarchivedMonths = loadUnarchivedMonths;
    this._putExpensesChecking = putExpensesChecking;
    this.addEventListener('loadUnarchivedMonths', () => void this.handleLoadUnarchivedMonths());
    this.addEventListener('goToPreviousMonth', () => this.handleGoToPreviousMonth());
    this.addEventListener('goToNextMonth', () => this.handleGoToNextMonth());
    this.addEventListener('putExpensesChecking', (e: Event) => {
      const d = (e as CustomEvent<PutExpensesCheckingActionDetail>).detail;
      if (d?.expenseId && d.weeklyBudgetId) void this.handlePutExpensesChecking(d);
    });
  }

  private _loadUnarchivedMonths: LoadUnarchivedMonthsUseCase;
  private _putExpensesChecking: PutExpensesCheckingUseCase;

  private async handleLoadUnarchivedMonths(): Promise<void> {
    this.setState({ isLoadingMonths: true, loadMonthsErrorMessage: null });
    this.emitStateChange('unarchivedMonthsLoading');
    try {
      const months = await this._loadUnarchivedMonths();
      this.setState({
        months,
        currentIndex: 0,
        isLoadingMonths: false,
        loadMonthsErrorMessage: null,
      });
      this.emitStateChange('unarchivedMonthsLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ isLoadingMonths: false, loadMonthsErrorMessage: message });
      this.emitStateChange('unarchivedMonthsLoadFailed', { message });
    }
  }

  private handleGoToPreviousMonth(): void {
    const { months, currentIndex } = this.getState();
    if (months.length === 0) return;
    const next = Math.max(0, currentIndex - 1);
    if (next === currentIndex) return;
    this.setState({ currentIndex: next });
    this.emitCurrentMonthChanged();
  }

  private handleGoToNextMonth(): void {
    const { months, currentIndex } = this.getState();
    if (months.length === 0) return;
    const next = Math.min(months.length - 1, currentIndex + 1);
    if (next === currentIndex) return;
    this.setState({ currentIndex: next });
    this.emitCurrentMonthChanged();
  }

  private async handlePutExpensesChecking(detail: PutExpensesCheckingActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    const toggled = applyExpenseToggleToMonthView(month, detail);
    const body = buildExpensesCheckingPayload(toggled);
    this.emitStateChange('expensesCheckingLoading');
    try {
      const updated = await this._putExpensesChecking({ monthId: month.id, body });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('expensesCheckingLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('expensesCheckingFailed', { message });
    }
  }

  /** Notifie les WC (barre récap, écran budgets) après changement du mois courant. */
  emitCurrentMonthChanged(): void {
    const month = getCurrentMonth({ state: this.getState() });
    if (!month) {
      this.emitStateChange('currentMonthChanged', { month: null as MonthView | null });
      return;
    }
    this.emitStateChange('currentMonthChanged', { month });
  }

  getCurrentMonthIdForNav(): string {
    return getCurrentMonth({ state: this.getState() })?.id ?? '';
  }
}
