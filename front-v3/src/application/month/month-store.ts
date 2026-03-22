import { Store } from '../store.js';
import {
  applyExpenseToggleToMonthView,
  buildExpensesCheckingPayload,
} from './expenses-checking-payload.js';
import { DEFAULT_MONTH_STATE, getCurrentMonth, type MonthState } from './month-state.js';
import type { CreateExpenseUseCase } from './create-expense.js';
import type { DeleteBudgetUseCase } from './delete-budget.js';
import type { DeleteExpenseUseCase } from './delete-expense.js';
import type { LoadUnarchivedMonthsUseCase } from './load-unarchived-months.js';
import type { PutExpensesCheckingUseCase } from './put-expenses-checking.js';
import type { MonthView } from './month-view.js';

export const LOADING_EXPENSES_CHECKING_TEXT = 'Mise à jour des dépenses en cours';
export const LOADING_DELETE_EXPENSE_TEXT = 'Suppression de la dépense en cours';
export const LOADING_DELETE_BUDGET_TEXT = 'Suppression du budget en cours';
export const LOADING_CREATE_EXPENSE_TEXT = 'Ajout de la dépense en cours';

export type PutExpensesCheckingActionDetail = {
  weeklyBudgetId: string;
  expenseId: string;
  isChecked: boolean;
};

export type DeleteExpenseActionDetail = {
  weeklyBudgetId: string;
  expenseId: string;
};

export type DeleteBudgetActionDetail = {
  /** Id enveloppe / budget hebdo (route `.../budgets/:budgetId`). */
  budgetId: string;
};

export type CreateExpenseActionDetail = {
  weeklyBudgetId: string;
  /** Libellé envoyé à l’API (ex. « 🔥 Toto »). */
  label: string;
  amount: number;
};

export class MonthStore extends Store<MonthState> {
  constructor({
    loadUnarchivedMonths,
    putExpensesChecking,
    deleteExpense,
    deleteBudget,
    createExpense,
  }: {
    loadUnarchivedMonths: LoadUnarchivedMonthsUseCase;
    putExpensesChecking: PutExpensesCheckingUseCase;
    deleteExpense: DeleteExpenseUseCase;
    deleteBudget: DeleteBudgetUseCase;
    createExpense: CreateExpenseUseCase;
  }) {
    super(DEFAULT_MONTH_STATE);
    this._loadUnarchivedMonths = loadUnarchivedMonths;
    this._putExpensesChecking = putExpensesChecking;
    this._deleteExpense = deleteExpense;
    this._deleteBudget = deleteBudget;
    this._createExpense = createExpense;
    this.addEventListener('loadUnarchivedMonths', () => void this.handleLoadUnarchivedMonths());
    this.addEventListener('goToPreviousMonth', () => this.handleGoToPreviousMonth());
    this.addEventListener('goToNextMonth', () => this.handleGoToNextMonth());
    this.addEventListener('putExpensesChecking', (e: Event) => {
      const d = (e as CustomEvent<PutExpensesCheckingActionDetail>).detail;
      if (d?.expenseId && d.weeklyBudgetId) void this.handlePutExpensesChecking(d);
    });
    this.addEventListener('deleteExpense', (e: Event) => {
      const d = (e as CustomEvent<DeleteExpenseActionDetail>).detail;
      if (d?.expenseId && d.weeklyBudgetId) void this.handleDeleteExpense(d);
    });
    this.addEventListener('deleteBudget', (e: Event) => {
      const d = (e as CustomEvent<DeleteBudgetActionDetail>).detail;
      if (d?.budgetId) void this.handleDeleteBudget(d);
    });
    this.addEventListener('createExpense', (e: Event) => {
      const d = (e as CustomEvent<CreateExpenseActionDetail>).detail;
      if (d?.weeklyBudgetId && d.label?.trim() && d.amount !== undefined && d.amount > 0) void this.handleCreateExpense(d);
    });
  }

  private _loadUnarchivedMonths: LoadUnarchivedMonthsUseCase;
  private _putExpensesChecking: PutExpensesCheckingUseCase;
  private _deleteExpense: DeleteExpenseUseCase;
  private _deleteBudget: DeleteBudgetUseCase;
  private _createExpense: CreateExpenseUseCase;

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

  private async handleDeleteExpense(detail: DeleteExpenseActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    this.emitStateChange('expenseDeleteLoading');
    try {
      const updated = await this._deleteExpense({
        monthId: month.id,
        weeklyBudgetId: detail.weeklyBudgetId,
        expenseId: detail.expenseId,
      });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('expenseDeleteLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('expenseDeleteFailed', { message });
    }
  }

  private async handleCreateExpense(detail: CreateExpenseActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    this.emitStateChange('expenseCreateLoading');
    try {
      const updated = await this._createExpense({
        monthId: month.id,
        weeklyBudgetId: detail.weeklyBudgetId,
        label: detail.label,
        amount: detail.amount,
      });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('expenseCreateLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('expenseCreateFailed', { message });
    }
  }

  private async handleDeleteBudget(detail: DeleteBudgetActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    this.emitStateChange('budgetDeleteLoading');
    try {
      const updated = await this._deleteBudget({ monthId: month.id, budgetId: detail.budgetId });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('budgetDeleteLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('budgetDeleteFailed', { message });
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
