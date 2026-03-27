import { Store } from '../store.js';
import {
  applyExpenseToggleToMonthView,
  buildExpensesCheckingPayload,
} from './expenses-checking-payload.js';
import { DEFAULT_MONTH_STATE, getCurrentMonth, type MonthState } from './month-state.js';
import type { CreateBudgetUseCase } from './create-budget.js';
import type { CreateExpenseUseCase } from './create-expense.js';
import type { CreateOutflowUseCase } from './create-outflow.js';
import type { DeleteBudgetUseCase } from './delete-budget.js';
import type { DeleteExpenseUseCase } from './delete-expense.js';
import type { DeleteOutflowUseCase } from './delete-outflow.js';
import type { LoadUnarchivedMonthsUseCase } from './load-unarchived-months.js';
import type { PutExpensesCheckingUseCase } from './put-expenses-checking.js';
import type { PutOutflowsCheckingUseCase } from './put-outflows-checking.js';
import type { UpdateBudgetUseCase } from './update-budget.js';
import type { TransferFromWeeklyBudgetUseCase } from './transfer-from-weekly-budget.js';
import type { TransferFromAccountUseCase } from './transfer-from-account.js';
import type { MonthView } from './month-view.js';
import {
  applyOutflowToggleToMonthView,
  buildOutflowsCheckingPayload,
} from './outflows-checking-payload.js';

export const LOADING_EXPENSES_CHECKING_TEXT = 'Mise à jour des dépenses en cours';
export const LOADING_OUTFLOWS_CHECKING_TEXT = 'Mise à jour des charges en cours';
export const LOADING_CURRENT_BALANCE_UPDATE_TEXT = 'Mise à jour du solde en cours';
export const LOADING_DELETE_EXPENSE_TEXT = 'Suppression de la dépense en cours';
export const LOADING_DELETE_OUTFLOW_TEXT = 'Suppression de la charge en cours';
export const LOADING_DELETE_BUDGET_TEXT = 'Suppression du budget en cours';
export const LOADING_CREATE_EXPENSE_TEXT = 'Ajout de la dépense en cours';
export const LOADING_CREATE_BUDGET_TEXT = 'Ajout du budget en cours';
export const LOADING_CREATE_OUTFLOW_TEXT = 'Ajout de la charge en cours';
export const LOADING_UPDATE_BUDGET_TEXT = 'Mise à jour du budget en cours';
export const LOADING_TRANSFER_BUDGET_TEXT = 'Transfert en cours';

export type PutExpensesCheckingActionDetail = {
  weeklyBudgetId: string;
  expenseId: string;
  isChecked: boolean;
};

export type PutOutflowsCheckingActionDetail = {
  outflowId: string;
  isChecked: boolean;
};

export type UpdateCurrentBalanceActionDetail = {
  currentBalance: number;
};

export type DeleteExpenseActionDetail = {
  weeklyBudgetId: string;
  expenseId: string;
};

export type DeleteOutflowActionDetail = {
  outflowId: string;
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

export type CreateBudgetActionDetail = {
  /** Nom API (ex. « 🔥 Test »). */
  name: string;
  initialBalance: number;
};

export type CreateOutflowActionDetail = {
  label: string;
  amount: number;
};

export type UpdateBudgetActionDetail = {
  budgetId: string;
  /** Nom API (ex. « 🔥 Semaine 123 »). */
  name: string;
};

export type TransferFromWeeklyBudgetActionDetail = {
  fromWeeklyBudgetId: string;
  destinationType: 'weekly-budget' | 'account';
  destinationId: string;
  amount: number;
};

export type TransferFromAccountActionDetail = {
  fromAccountId: string;
  toWeeklyBudgetId: string;
  amount: number;
};

export class MonthStore extends Store<MonthState> {
  constructor({
    loadUnarchivedMonths,
    putExpensesChecking,
    putOutflowsChecking,
    deleteExpense,
    deleteOutflow,
    deleteBudget,
    createExpense,
    createBudget,
    createOutflow,
    updateBudget,
    transferFromWeeklyBudget,
    transferFromAccount,
  }: {
    loadUnarchivedMonths: LoadUnarchivedMonthsUseCase;
    putExpensesChecking: PutExpensesCheckingUseCase;
    putOutflowsChecking: PutOutflowsCheckingUseCase;
    deleteExpense: DeleteExpenseUseCase;
    deleteOutflow: DeleteOutflowUseCase;
    deleteBudget: DeleteBudgetUseCase;
    createExpense: CreateExpenseUseCase;
    createBudget: CreateBudgetUseCase;
    createOutflow: CreateOutflowUseCase;
    updateBudget: UpdateBudgetUseCase;
    transferFromWeeklyBudget: TransferFromWeeklyBudgetUseCase;
    transferFromAccount: TransferFromAccountUseCase;
  }) {
    super(DEFAULT_MONTH_STATE);
    this._loadUnarchivedMonths = loadUnarchivedMonths;
    this._putExpensesChecking = putExpensesChecking;
    this._putOutflowsChecking = putOutflowsChecking;
    this._deleteExpense = deleteExpense;
    this._deleteOutflow = deleteOutflow;
    this._deleteBudget = deleteBudget;
    this._createExpense = createExpense;
    this._createBudget = createBudget;
    this._createOutflow = createOutflow;
    this._updateBudget = updateBudget;
    this._transferFromWeeklyBudget = transferFromWeeklyBudget;
    this._transferFromAccount = transferFromAccount;
    this.addEventListener('loadUnarchivedMonths', () => void this.handleLoadUnarchivedMonths());
    this.addEventListener('goToPreviousMonth', () => this.handleGoToPreviousMonth());
    this.addEventListener('goToNextMonth', () => this.handleGoToNextMonth());
    this.addEventListener('putExpensesChecking', (e: Event) => {
      const d = (e as CustomEvent<PutExpensesCheckingActionDetail>).detail;
      if (d?.expenseId && d.weeklyBudgetId) void this.handlePutExpensesChecking(d);
    });
    this.addEventListener('putOutflowsChecking', (e: Event) => {
      const d = (e as CustomEvent<PutOutflowsCheckingActionDetail>).detail;
      if (d?.outflowId) void this.handlePutOutflowsChecking(d);
    });
    this.addEventListener('updateCurrentBalance', (e: Event) => {
      const d = (e as CustomEvent<UpdateCurrentBalanceActionDetail>).detail;
      if (d?.currentBalance !== undefined) void this.handleUpdateCurrentBalance(d);
    });
    this.addEventListener('deleteExpense', (e: Event) => {
      const d = (e as CustomEvent<DeleteExpenseActionDetail>).detail;
      if (d?.expenseId && d.weeklyBudgetId) void this.handleDeleteExpense(d);
    });
    this.addEventListener('deleteOutflow', (e: Event) => {
      const d = (e as CustomEvent<DeleteOutflowActionDetail>).detail;
      if (d?.outflowId) void this.handleDeleteOutflow(d);
    });
    this.addEventListener('deleteBudget', (e: Event) => {
      const d = (e as CustomEvent<DeleteBudgetActionDetail>).detail;
      if (d?.budgetId) void this.handleDeleteBudget(d);
    });
    this.addEventListener('createExpense', (e: Event) => {
      const d = (e as CustomEvent<CreateExpenseActionDetail>).detail;
      if (d?.weeklyBudgetId && d.label?.trim() && d.amount !== undefined && d.amount > 0) void this.handleCreateExpense(d);
    });
    this.addEventListener('createBudget', (e: Event) => {
      const d = (e as CustomEvent<CreateBudgetActionDetail>).detail;
      if (d?.name?.trim() && d.initialBalance !== undefined && d.initialBalance > 0) void this.handleCreateBudget(d);
    });
    this.addEventListener('createOutflow', (e: Event) => {
      const d = (e as CustomEvent<CreateOutflowActionDetail>).detail;
      if (d?.label?.trim() && d.amount !== undefined && d.amount > 0) void this.handleCreateOutflow(d);
    });
    this.addEventListener('updateBudget', (e: Event) => {
      const d = (e as CustomEvent<UpdateBudgetActionDetail>).detail;
      if (d?.budgetId && d.name?.trim()) void this.handleUpdateBudget(d);
    });
    this.addEventListener('transferFromWeeklyBudget', (e: Event) => {
      const d = (e as CustomEvent<TransferFromWeeklyBudgetActionDetail>).detail;
      if (!d?.fromWeeklyBudgetId || !d.destinationId || d.amount === undefined || d.amount <= 0) return;
      if (d.destinationType !== 'weekly-budget' && d.destinationType !== 'account') return;
      void this.handleTransferFromWeeklyBudget(d);
    });
    this.addEventListener('transferFromAccount', (e: Event) => {
      const d = (e as CustomEvent<TransferFromAccountActionDetail>).detail;
      if (!d?.fromAccountId || !d.toWeeklyBudgetId || d.amount === undefined || d.amount <= 0) return;
      void this.handleTransferFromAccount(d);
    });
  }

  private _loadUnarchivedMonths: LoadUnarchivedMonthsUseCase;
  private _putExpensesChecking: PutExpensesCheckingUseCase;
  private _putOutflowsChecking: PutOutflowsCheckingUseCase;
  private _deleteExpense: DeleteExpenseUseCase;
  private _deleteOutflow: DeleteOutflowUseCase;
  private _deleteBudget: DeleteBudgetUseCase;
  private _createExpense: CreateExpenseUseCase;
  private _createBudget: CreateBudgetUseCase;
  private _createOutflow: CreateOutflowUseCase;
  private _updateBudget: UpdateBudgetUseCase;
  private _transferFromWeeklyBudget: TransferFromWeeklyBudgetUseCase;
  private _transferFromAccount: TransferFromAccountUseCase;

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

  private async handlePutOutflowsChecking(detail: PutOutflowsCheckingActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    const toggled = applyOutflowToggleToMonthView(month, detail);
    const body = buildOutflowsCheckingPayload(toggled);
    this.emitStateChange('outflowsCheckingLoading');
    try {
      const updated = await this._putOutflowsChecking({ monthId: month.id, body });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('outflowsCheckingLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('outflowsCheckingFailed', { message });
    }
  }

  private async handleUpdateCurrentBalance(detail: UpdateCurrentBalanceActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    const body = {
      currentBalance: detail.currentBalance,
      outflows: (month.outflows ?? []).map((o) => ({
        id: o.id,
        pendingFrom: o.pendingFrom,
        label: o.label,
        amount: o.amount,
        isChecked: o.isChecked,
      })),
    };
    this.emitStateChange('currentBalanceUpdateLoading');
    try {
      const updated = await this._putOutflowsChecking({ monthId: month.id, body });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('currentBalanceUpdateLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('currentBalanceUpdateFailed', { message });
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

  private async handleDeleteOutflow(detail: DeleteOutflowActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    this.emitStateChange('outflowDeleteLoading');
    try {
      const updated = await this._deleteOutflow({
        monthId: month.id,
        outflowId: detail.outflowId,
      });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('outflowDeleteLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('outflowDeleteFailed', { message });
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

  private async handleCreateBudget(detail: CreateBudgetActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    this.emitStateChange('budgetCreateLoading');
    try {
      const updated = await this._createBudget({
        monthId: month.id,
        name: detail.name,
        initialBalance: detail.initialBalance,
      });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('budgetCreateLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('budgetCreateFailed', { message });
    }
  }

  private async handleCreateOutflow(detail: CreateOutflowActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    this.emitStateChange('outflowCreateLoading');
    try {
      const updated = await this._createOutflow({
        monthId: month.id,
        label: detail.label,
        amount: detail.amount,
      });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('outflowCreateLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('outflowCreateFailed', { message });
    }
  }

  private async handleUpdateBudget(detail: UpdateBudgetActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    this.emitStateChange('budgetUpdateLoading');
    try {
      const updated = await this._updateBudget({
        monthId: month.id,
        budgetId: detail.budgetId,
        name: detail.name.trim(),
      });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('budgetUpdateLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('budgetUpdateFailed', { message });
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

  private async handleTransferFromWeeklyBudget(detail: TransferFromWeeklyBudgetActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    this.emitStateChange('budgetTransferLoading');
    try {
      const updated = await this._transferFromWeeklyBudget({
        monthId: month.id,
        fromWeeklyBudgetId: detail.fromWeeklyBudgetId,
        destinationType: detail.destinationType,
        destinationId: detail.destinationId,
        amount: detail.amount,
      });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('budgetTransferLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('budgetTransferFailed', { message });
    }
  }

  private async handleTransferFromAccount(detail: TransferFromAccountActionDetail): Promise<void> {
    const state = this.getState();
    const month = getCurrentMonth({ state });
    if (!month) return;
    this.emitStateChange('budgetTransferLoading');
    try {
      const updated = await this._transferFromAccount({
        monthId: month.id,
        fromAccountId: detail.fromAccountId,
        toWeeklyBudgetId: detail.toWeeklyBudgetId,
        amount: detail.amount,
      });
      const months = state.months.map((m) => (m.id === updated.id ? updated : m));
      this.setState({ months });
      this.emitStateChange('budgetTransferLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('budgetTransferFailed', { message });
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
