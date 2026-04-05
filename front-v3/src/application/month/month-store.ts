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
import type { ArchiveMonthUseCase } from './archive-month.js';
import type { CreateMonthUseCase } from './create-month.js';
import type { LoadUnarchivedMonthsUseCase } from './load-unarchived-months.js';
import type { CreateMonthApiBody } from '../new-month/default-new-month-bundle.js';
import type { PutExpensesCheckingUseCase } from './put-expenses-checking.js';
import type { PutOutflowsCheckingUseCase } from './put-outflows-checking.js';
import type { UpdateBudgetUseCase } from './update-budget.js';
import type { TransferFromWeeklyBudgetUseCase } from './transfer-from-weekly-budget.js';
import type { TransferFromAccountUseCase } from './transfer-from-account.js';
import type { MonthView } from './month-view.js';
import { DEFAULT_ROUTE_MONTH_PLACEHOLDER_ID } from '../../default-route-month-placeholder.js';
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
export const LOADING_ARCHIVE_MONTH_TEXT = 'Archivage du mois en cours';

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

export type ArchiveMonthActionDetail = {
  monthId: string;
};

export type CreateMonthActionDetail = {
  body: CreateMonthApiBody;
};

/** Réponse API désarchivage : liste complète des mois non archivés. */
export type ApplyUnarchivedMonthsFromApiActionDetail = {
  months: MonthView[];
  /** Mois à sélectionner dans le sélecteur (ex. celui qu’on vient de désarchiver). */
  preferredMonthId?: string;
};

function computeMonthsAfterArchive(
  months: MonthView[],
  currentIndex: number,
  archivedMonthId: string
): { months: MonthView[]; currentIndex: number } {
  const removedIndex = months.findIndex((m) => m.id === archivedMonthId);
  if (removedIndex < 0) {
    return { months: [...months], currentIndex };
  }
  const newMonths = months.filter((m) => m.id !== archivedMonthId);
  let newIndex = currentIndex;
  if (newMonths.length === 0) {
    newIndex = 0;
  } else if (removedIndex < currentIndex) {
    newIndex = currentIndex - 1;
  } else if (removedIndex === currentIndex) {
    newIndex = Math.min(currentIndex, newMonths.length - 1);
  }
  return { months: newMonths, currentIndex: newIndex };
}

export class MonthStore extends Store<MonthState> {
  constructor({
    loadUnarchivedMonths,
    archiveMonth,
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
    createMonth,
  }: {
    loadUnarchivedMonths: LoadUnarchivedMonthsUseCase;
    createMonth: CreateMonthUseCase;
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
    archiveMonth: ArchiveMonthUseCase;
  }) {
    super(DEFAULT_MONTH_STATE);
    this._loadUnarchivedMonths = loadUnarchivedMonths;
    this._createMonth = createMonth;
    this._archiveMonth = archiveMonth;
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
    this.addEventListener('archiveMonth', (e: Event) => {
      const d = (e as CustomEvent<ArchiveMonthActionDetail>).detail;
      if (!d?.monthId) return;
      void this.handleArchiveMonth(d);
    });
    this.addEventListener('syncCurrentMonthToRouteId', (e: Event) => {
      const d = (e as CustomEvent<{ monthId: string }>).detail;
      if (d?.monthId) this.handleSyncCurrentMonthToRouteId(d.monthId);
    });
    this.addEventListener('applyUnarchivedMonthsFromApi', (e: Event) => {
      const d = (e as CustomEvent<ApplyUnarchivedMonthsFromApiActionDetail>).detail;
      if (d?.months) this.handleApplyUnarchivedMonthsFromApi(d);
    });
    this.addEventListener('createMonth', (e: Event) => {
      const d = (e as CustomEvent<CreateMonthActionDetail>).detail;
      if (d?.body) void this.handleCreateMonth(d);
    });
  }

  private _loadUnarchivedMonths: LoadUnarchivedMonthsUseCase;
  private _createMonth: CreateMonthUseCase;
  private _archiveMonth: ArchiveMonthUseCase;
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
    if (this.getState().isLoadingMonths) return;
    this.setState({ isLoadingMonths: true, loadMonthsErrorMessage: null });
    this.emitStateChange('unarchivedMonthsLoading');
    try {
      const months = await this._loadUnarchivedMonths();
      const pending = this.getState().pendingRouteMonthId;
      this.setState({
        months,
        currentIndex: 0,
        isLoadingMonths: false,
        loadMonthsErrorMessage: null,
        pendingRouteMonthId: null,
      });
      this.emitStateChange('unarchivedMonthsLoaded');
      if (pending) {
        this._applyRouteMonthIdSync(pending);
      } else {
        this.emitCurrentMonthChanged();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setState({
        isLoadingMonths: false,
        loadMonthsErrorMessage: message,
        pendingRouteMonthId: null,
        months: [],
      });
      this.emitStateChange('unarchivedMonthsLoadFailed', { message });
    }
  }

  private handleSyncCurrentMonthToRouteId(monthId: string): void {
    const id = monthId.trim();
    if (!id) return;
    const current = getCurrentMonth({ state: this.getState() });
    if (
      current?.id &&
      (current.id === id || current.id.toLowerCase() === id.toLowerCase())
    ) {
      this.emitCurrentMonthChanged();
      return;
    }
    const { isLoadingMonths, months } = this.getState();
    if (months === null) {
      this.setState({ pendingRouteMonthId: id });
      if (!isLoadingMonths) {
        this.emitAction('loadUnarchivedMonths');
      }
      return;
    }
    if (isLoadingMonths) {
      this.setState({ pendingRouteMonthId: id });
      return;
    }
    if (months.length === 0) {
      this.setState({ pendingRouteMonthId: id });
      this.emitAction('loadUnarchivedMonths');
      return;
    }
    this._applyRouteMonthIdSync(id);
  }

  /** Aligne `currentIndex` sur `monthId` ou émet `routeMonthIdNotFound`. */
  private _applyRouteMonthIdSync(monthId: string): void {
    const { months } = this.getState();
    if (months === null) {
      this.setState({ pendingRouteMonthId: monthId });
      if (!this.getState().isLoadingMonths) {
        this.emitAction('loadUnarchivedMonths');
      }
      return;
    }
    const idx = months.findIndex(
      (m) => m.id === monthId || m.id.toLowerCase() === monthId.toLowerCase()
    );
    if (idx >= 0) {
      this.setState({ currentIndex: idx });
      this.emitCurrentMonthChanged();
      return;
    }
    /** Route `/budgets` sans id : URL temporaire avec id placeholder absent de l’API — pas d’erreur, premier mois. */
    const isPlaceholder =
      monthId === DEFAULT_ROUTE_MONTH_PLACEHOLDER_ID ||
      monthId.toLowerCase() === DEFAULT_ROUTE_MONTH_PLACEHOLDER_ID.toLowerCase();
    if (isPlaceholder && months.length > 0) {
      this.setState({ currentIndex: 0 });
      this.emitCurrentMonthChanged();
      return;
    }
    this.emitStateChange('routeMonthIdNotFound', { monthId });
    this.emitCurrentMonthChanged();
  }

  /** Met à jour la liste des mois actifs depuis la réponse API après désarchivage. */
  private handleApplyUnarchivedMonthsFromApi(detail: ApplyUnarchivedMonthsFromApiActionDetail): void {
    const { months, preferredMonthId } = detail;
    let nextIndex = 0;
    if (preferredMonthId) {
      const idx = months.findIndex((m) => m.id === preferredMonthId);
      if (idx >= 0) nextIndex = idx;
    } else {
      const prev = getCurrentMonth({ state: this.getState() })?.id;
      if (prev) {
        const idx = months.findIndex((m) => m.id === prev);
        if (idx >= 0) nextIndex = idx;
      }
    }
    this.setState({
      months,
      currentIndex: months.length === 0 ? 0 : Math.min(nextIndex, months.length - 1),
      isLoadingMonths: false,
      loadMonthsErrorMessage: null,
      pendingRouteMonthId: null,
    });
    this.emitStateChange('unarchivedMonthsLoaded');
    this.emitCurrentMonthChanged();
  }

  private handleGoToPreviousMonth(): void {
    const { months, currentIndex } = this.getState();
    if (months === null || months.length === 0) return;
    const next = Math.max(0, currentIndex - 1);
    if (next === currentIndex) return;
    this.setState({ currentIndex: next });
    this.emitCurrentMonthChanged();
  }

  private handleGoToNextMonth(): void {
    const { months, currentIndex } = this.getState();
    if (months === null || months.length === 0) return;
    const next = Math.min(months.length - 1, currentIndex + 1);
    if (next === currentIndex) return;
    this.setState({ currentIndex: next });
    this.emitCurrentMonthChanged();
  }

  private async handlePutExpensesChecking(detail: PutExpensesCheckingActionDetail): Promise<void> {
    const state = this.getState();
    if (state.months === null) return;
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
    if (state.months === null) return;
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
    if (state.months === null) return;
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
    if (state.months === null) return;
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
    if (state.months === null) return;
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
    if (state.months === null) return;
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
    if (state.months === null) return;
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
    if (state.months === null) return;
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
    if (state.months === null) return;
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
    if (state.months === null) return;
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
    if (state.months === null) return;
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

  private async handleCreateMonth(detail: CreateMonthActionDetail): Promise<void> {
    this.emitStateChange('createMonthLoading');
    try {
      const created = await this._createMonth({ body: detail.body });
      const state = this.getState();
      const others = (state.months ?? []).filter((m) => m.id !== created.id);
      const months = [...others, created].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
      const idx = months.findIndex((m) => m.id === created.id);
      this.setState({
        months,
        currentIndex: idx >= 0 ? idx : state.currentIndex,
        isLoadingMonths: false,
        loadMonthsErrorMessage: null,
      });
      this.emitStateChange('createMonthLoaded');
      this.emitStateChange('monthCreated', { monthId: created.id });
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('createMonthFailed', { message });
    }
  }

  private async handleArchiveMonth(detail: ArchiveMonthActionDetail): Promise<void> {
    const state = this.getState();
    if (state.months === null) return;
    const month = getCurrentMonth({ state });
    if (!month || month.id !== detail.monthId) return;
    this.emitStateChange('archiveMonthLoading');
    try {
      await this._archiveMonth({ monthId: detail.monthId });
      const next = computeMonthsAfterArchive(state.months, state.currentIndex, detail.monthId);
      this.setState({ months: next.months, currentIndex: next.currentIndex });
      this.emitStateChange('archiveMonthLoaded');
      this.emitCurrentMonthChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('archiveMonthFailed', { message });
    }
  }

  private async handleTransferFromAccount(detail: TransferFromAccountActionDetail): Promise<void> {
    const state = this.getState();
    if (state.months === null) return;
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
