/**
 * Écran Mes budgets : charge les mois non archivés, barre récap + liste depuis MonthStore.
 */
import type { BuddjBudgetAddDrawerElement } from '../organisms/buddj-budget-add-drawer.js';
import {
  LOADING_CREATE_BUDGET_TEXT,
  LOADING_CREATE_EXPENSE_TEXT,
  LOADING_DELETE_BUDGET_TEXT,
  LOADING_DELETE_EXPENSE_TEXT,
  LOADING_EXPENSES_CHECKING_TEXT,
  LOADING_UPDATE_BUDGET_TEXT,
  LOADING_TRANSFER_BUDGET_TEXT,
  type CreateBudgetActionDetail,
  type CreateExpenseActionDetail,
  type DeleteBudgetActionDetail,
  type DeleteExpenseActionDetail,
  type MonthStore,
  type PutExpensesCheckingActionDetail,
  type TransferFromWeeklyBudgetActionDetail,
  type UpdateBudgetActionDetail,
  type TransferFromAccountActionDetail,
} from '../../application/month/month-store.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjLoadingModal } from '../molecules/buddj-loading-modal.js';
import type { MonthView } from '../../application/month/month-view.js';
import type { Budget, BudgetGroupData } from '../../application/month/month-types.js';
import { formatEuros } from '../../shared/goal.js';

const LOADING_MONTHS_TEXT = 'Chargement des mois en cours';

/** Reste par budget : même formule que `buddj-budget-card` (alloué − somme des dépenses). */
function budgetRemaining({ allocated, expenses }: Budget): number {
  const sumExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  return Math.round((allocated - sumExpenses) * 100) / 100;
}

function openBudgetKey(card: Element): string {
  const wid = card.getAttribute('weekly-budget-id');
  if (wid) return `wid:${wid}`;
  const group = card.closest('buddj-budget-group');
  const groupTitle = group?.getAttribute('title') ?? '';
  const name = card.getAttribute('name') ?? '';
  return `grp:${groupTitle}|${name}`;
}

export class BuddjScreenBudgets extends HTMLElement {
  static readonly tagName = 'buddj-screen-budgets';

  private _monthStore?: MonthStore;
  private _loadingModal?: BuddjLoadingModal;
  private _monthListenersAttached = false;

  init({ monthStore }: { monthStore: MonthStore }): void {
    this._monthStore = monthStore;
  }

  private _onExpenseAddSubmit = (e: Event): void => {
    if (!this._monthStore) return;
    const ev = e as CustomEvent<CreateExpenseActionDetail>;
    const { weeklyBudgetId, label, amount } = ev.detail ?? {};
    if (!weeklyBudgetId || !label || amount === undefined) return;
    this._monthStore.emitAction('createExpense', { weeklyBudgetId, label, amount });
  };

  private _onBudgetCreateSubmit = (e: Event): void => {
    if (!this._monthStore) return;
    const ev = e as CustomEvent<CreateBudgetActionDetail>;
    const { name, initialBalance } = ev.detail ?? {};
    if (!name || initialBalance === undefined) return;
    this._monthStore.emitAction('createBudget', { name, initialBalance });
  };

  private _onAccountTransferSubmit = (e: Event): void => {
    if (!this._monthStore) return;
    const ev = e as CustomEvent<TransferFromAccountActionDetail>;
    const { fromAccountId, toWeeklyBudgetId, amount } = ev.detail ?? {};
    if (!fromAccountId || !toWeeklyBudgetId || amount === undefined || amount <= 0) return;
    this._monthStore.emitAction('transferFromAccount', { fromAccountId, toWeeklyBudgetId, amount });
  };

  connectedCallback(): void {
    if (this.querySelector('#budgets')) return;
    const main = document.createElement('main');
    main.id = 'budgets';
    main.className = 'screen screen--budgets';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap">
        <header class="screen-header">
          <div class="screen-header-row screen-header-row--title">
            <h1 class="title">Mes budgets</h1>
            <buddj-toggle-all target-selector=".budget-details" title-expand="Déplier tous les budgets" title-collapse="Replier tous les budgets"></buddj-toggle-all>
            <buddj-btn-add label="" title="Ajouter un budget" data-budget-header-add hidden></buddj-btn-add>
          </div>
          <p class="budget-screen-recap" data-budget-screen-recap hidden aria-live="polite"></p>
        </header>
      </div>
      <section class="budget-list"></section>
    `;
    this.appendChild(main);
    document.addEventListener('buddj-expense-add-submit', this._onExpenseAddSubmit);
    document.addEventListener('buddj-budget-create-submit', this._onBudgetCreateSubmit);
    document.addEventListener('buddj-account-transfer-confirmed', this._onAccountTransferSubmit as EventListener);
    this.attachListeners();
    this.attachExpenseCheckingListener(main);
    this.attachExpenseDeleteListener(main);
    this.attachBudgetDeleteListener(main);
    this.attachBudgetUpdateListener(main);
    this.attachBudgetTransferListener(main);
    if (this._monthStore && !this._monthListenersAttached) {
      this._attachMonthStoreListeners();
      const s = this._monthStore.getState();
      if (s.months.length === 0 && !s.isLoadingMonths) {
        this._monthStore.emitAction('loadUnarchivedMonths');
      }
    }
    this._syncBudgetHeaderToolbarVisibility();
  }

  disconnectedCallback(): void {
    document.removeEventListener('buddj-expense-add-submit', this._onExpenseAddSubmit);
    document.removeEventListener('buddj-budget-create-submit', this._onBudgetCreateSubmit);
    document.removeEventListener('buddj-account-transfer-confirmed', this._onAccountTransferSubmit as EventListener);
    this._detachMonthStoreListeners();
  }

  private _attachMonthStoreListeners(): void {
    if (!this._monthStore || this._monthListenersAttached) return;
    this._monthListenersAttached = true;
    const loadingModal = document.createElement('buddj-loading-modal') as BuddjLoadingModal;
    this._loadingModal = loadingModal;
    this.appendChild(loadingModal);

    this._monthStore.addEventListener('unarchivedMonthsLoading', this._onUnarchivedMonthsLoading);
    this._monthStore.addEventListener('unarchivedMonthsLoaded', this._onUnarchivedMonthsLoaded);
    this._monthStore.addEventListener('unarchivedMonthsLoadFailed', this._onUnarchivedMonthsLoaded);
    this._monthStore.addEventListener('expensesCheckingLoading', this._onExpensesCheckingLoading);
    this._monthStore.addEventListener('expensesCheckingLoaded', this._onExpensesCheckingLoaded);
    this._monthStore.addEventListener('expensesCheckingFailed', this._onExpensesCheckingFailed);
    this._monthStore.addEventListener('expenseDeleteLoading', this._onExpenseDeleteLoading);
    this._monthStore.addEventListener('expenseDeleteLoaded', this._onExpenseDeleteLoaded);
    this._monthStore.addEventListener('expenseDeleteFailed', this._onExpenseDeleteFailed);
    this._monthStore.addEventListener('budgetDeleteLoading', this._onBudgetDeleteLoading);
    this._monthStore.addEventListener('budgetDeleteLoaded', this._onBudgetDeleteLoaded);
    this._monthStore.addEventListener('budgetDeleteFailed', this._onBudgetDeleteFailed);
    this._monthStore.addEventListener('expenseCreateLoading', this._onExpenseCreateLoading);
    this._monthStore.addEventListener('expenseCreateLoaded', this._onExpenseCreateLoaded);
    this._monthStore.addEventListener('expenseCreateFailed', this._onExpenseCreateFailed);
    this._monthStore.addEventListener('budgetCreateLoading', this._onBudgetCreateLoading);
    this._monthStore.addEventListener('budgetCreateLoaded', this._onBudgetCreateLoaded);
    this._monthStore.addEventListener('budgetCreateFailed', this._onBudgetCreateFailed);
    this._monthStore.addEventListener('budgetUpdateLoading', this._onBudgetUpdateLoading);
    this._monthStore.addEventListener('budgetUpdateLoaded', this._onBudgetUpdateLoaded);
    this._monthStore.addEventListener('budgetUpdateFailed', this._onBudgetUpdateFailed);
    this._monthStore.addEventListener('budgetTransferLoading', this._onBudgetTransferLoading);
    this._monthStore.addEventListener('budgetTransferLoaded', this._onBudgetTransferLoaded);
    this._monthStore.addEventListener('budgetTransferFailed', this._onBudgetTransferFailed);
    this._monthStore.addEventListener('currentMonthChanged', this._onCurrentMonthChanged);
  }

  private _detachMonthStoreListeners(): void {
    if (!this._monthStore || !this._monthListenersAttached) return;
    this._monthStore.removeEventListener('unarchivedMonthsLoading', this._onUnarchivedMonthsLoading);
    this._monthStore.removeEventListener('unarchivedMonthsLoaded', this._onUnarchivedMonthsLoaded);
    this._monthStore.removeEventListener('unarchivedMonthsLoadFailed', this._onUnarchivedMonthsLoaded);
    this._monthStore.removeEventListener('expensesCheckingLoading', this._onExpensesCheckingLoading);
    this._monthStore.removeEventListener('expensesCheckingLoaded', this._onExpensesCheckingLoaded);
    this._monthStore.removeEventListener('expensesCheckingFailed', this._onExpensesCheckingFailed);
    this._monthStore.removeEventListener('expenseDeleteLoading', this._onExpenseDeleteLoading);
    this._monthStore.removeEventListener('expenseDeleteLoaded', this._onExpenseDeleteLoaded);
    this._monthStore.removeEventListener('expenseDeleteFailed', this._onExpenseDeleteFailed);
    this._monthStore.removeEventListener('budgetDeleteLoading', this._onBudgetDeleteLoading);
    this._monthStore.removeEventListener('budgetDeleteLoaded', this._onBudgetDeleteLoaded);
    this._monthStore.removeEventListener('budgetDeleteFailed', this._onBudgetDeleteFailed);
    this._monthStore.removeEventListener('expenseCreateLoading', this._onExpenseCreateLoading);
    this._monthStore.removeEventListener('expenseCreateLoaded', this._onExpenseCreateLoaded);
    this._monthStore.removeEventListener('expenseCreateFailed', this._onExpenseCreateFailed);
    this._monthStore.removeEventListener('budgetCreateLoading', this._onBudgetCreateLoading);
    this._monthStore.removeEventListener('budgetCreateLoaded', this._onBudgetCreateLoaded);
    this._monthStore.removeEventListener('budgetCreateFailed', this._onBudgetCreateFailed);
    this._monthStore.removeEventListener('budgetUpdateLoading', this._onBudgetUpdateLoading);
    this._monthStore.removeEventListener('budgetUpdateLoaded', this._onBudgetUpdateLoaded);
    this._monthStore.removeEventListener('budgetUpdateFailed', this._onBudgetUpdateFailed);
    this._monthStore.removeEventListener('budgetTransferLoading', this._onBudgetTransferLoading);
    this._monthStore.removeEventListener('budgetTransferLoaded', this._onBudgetTransferLoaded);
    this._monthStore.removeEventListener('budgetTransferFailed', this._onBudgetTransferFailed);
    this._monthStore.removeEventListener('currentMonthChanged', this._onCurrentMonthChanged);
    this._monthListenersAttached = false;
    this._loadingModal?.hide();
    this._loadingModal = undefined;
  }

  private _onUnarchivedMonthsLoading = (): void => {
    this._loadingModal?.show(LOADING_MONTHS_TEXT);
  };

  private _onUnarchivedMonthsLoaded = (): void => {
    this._loadingModal?.hide();
  };

  private _onExpensesCheckingLoading = (): void => {
    this._loadingModal?.show(LOADING_EXPENSES_CHECKING_TEXT);
  };

  private _onExpensesCheckingLoaded = (): void => {
    this._loadingModal?.hide();
  };

  private _onExpensesCheckingFailed = (): void => {
    this._loadingModal?.hide();
  };

  private _onExpenseDeleteLoading = (): void => {
    this._loadingModal?.show(LOADING_DELETE_EXPENSE_TEXT);
  };

  private _onExpenseDeleteLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'La dépense a bien été supprimée' });
  };

  private _onExpenseDeleteFailed = (): void => {
    this._loadingModal?.hide();
  };

  private _onBudgetDeleteLoading = (): void => {
    this._loadingModal?.show(LOADING_DELETE_BUDGET_TEXT);
  };

  private _onBudgetDeleteLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'Le budget a bien été supprimé' });
  };

  private _onBudgetDeleteFailed = (e: Event): void => {
    this._loadingModal?.hide();
    const msg = (e as CustomEvent<{ message: string }>).detail?.message ?? 'Erreur';
    getToast()?.show({ message: msg, variant: 'error', durationMs: 1250 });
  };

  private _onExpenseCreateLoading = (): void => {
    this._loadingModal?.show(LOADING_CREATE_EXPENSE_TEXT);
  };

  private _onExpenseCreateLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'La dépense a bien été ajoutée' });
  };

  private _onExpenseCreateFailed = (): void => {
    this._loadingModal?.hide();
  };

  private _onBudgetCreateLoading = (): void => {
    this._loadingModal?.show(LOADING_CREATE_BUDGET_TEXT);
  };

  private _onBudgetCreateLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'Le budget a bien été ajouté' });
  };

  private _onBudgetCreateFailed = (): void => {
    this._loadingModal?.hide();
  };

  private _onBudgetUpdateLoading = (): void => {
    this._loadingModal?.show(LOADING_UPDATE_BUDGET_TEXT);
  };

  private _onBudgetUpdateLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'Le budget a bien été modifié' });
  };

  private _onBudgetUpdateFailed = (e: Event): void => {
    this._loadingModal?.hide();
    const msg = (e as CustomEvent<{ message: string }>).detail?.message ?? 'Erreur';
    getToast()?.show({ message: msg, variant: 'error', durationMs: 1250 });
  };

  private _onBudgetTransferLoading = (): void => {
    this._loadingModal?.show(LOADING_TRANSFER_BUDGET_TEXT);
  };

  private _onBudgetTransferLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'Le transfert a bien été effectué' });
  };

  private _onBudgetTransferFailed = (e: Event): void => {
    this._loadingModal?.hide();
    const msg = (e as CustomEvent<{ message: string }>).detail?.message ?? 'Erreur lors du transfert';
    getToast()?.show({ message: msg, variant: 'error', durationMs: 1250 });
  };

  private _onCurrentMonthChanged = (e: Event): void => {
    const ev = e as CustomEvent<{ month: MonthView | null }>;
    this._renderBudgetGroups(ev.detail?.month ?? null);
    const drawer = document.getElementById('month-search-drawer') as { refresh?: () => void } | null;
    drawer?.refresh?.();
  };

  private _hideBudgetScreenRecap(): void {
    const el = this.querySelector('[data-budget-screen-recap]') as HTMLElement | null;
    if (!el) return;
    el.textContent = '';
    el.setAttribute('hidden', '');
  }

  private _updateBudgetScreenRecap(groups: BudgetGroupData[]): void {
    const el = this.querySelector('[data-budget-screen-recap]') as HTMLElement | null;
    if (!el) return;
    let sumRemaining = 0;
    for (const g of groups) {
      for (const b of g.budgets) {
        sumRemaining += budgetRemaining(b);
      }
    }
    el.textContent = `${formatEuros(sumRemaining)} restants`;
    el.removeAttribute('hidden');
  }

  /** Sans mois dans le store : pas de « déplier tout » dans le header. */
  private _syncBudgetHeaderToolbarVisibility(): void {
    const main = this.querySelector('#budgets');
    if (!main) return;
    const months = this._monthStore?.getState().months ?? [];
    const hideTools = months.length === 0;
    main.querySelector('buddj-toggle-all')?.toggleAttribute('hidden', hideTools);
  }

  private _renderBudgetGroups(month: MonthView | null): void {
    const listSection = this.querySelector('.budget-list');
    if (!listSection) return;
    const storeState = this._monthStore?.getState();
    if (storeState && !storeState.isLoadingMonths && storeState.months.length === 0) {
      this.removeAttribute('current-account-id');
      this.querySelector('#budgets')?.removeAttribute('data-account-id');
      const headerAddBtn = this.querySelector('[data-budget-header-add]');
      if (headerAddBtn) headerAddBtn.setAttribute('hidden', '');
      listSection.replaceChildren();
      listSection.appendChild(document.createElement('buddj-months-empty-placeholder'));
      this._hideBudgetScreenRecap();
      this._syncBudgetHeaderToolbarVisibility();
      return;
    }
    if (month?.accountId) {
      this.setAttribute('current-account-id', month.accountId);
      this.querySelector('#budgets')?.setAttribute('data-account-id', month.accountId);
    } else {
      this.removeAttribute('current-account-id');
      this.querySelector('#budgets')?.removeAttribute('data-account-id');
    }
    const openKeys = new Set<string>();
    for (const card of listSection.querySelectorAll('buddj-budget-card')) {
      const details = card.querySelector('details.budget-details') as HTMLDetailsElement | null;
      if (details?.open) openKeys.add(openBudgetKey(card));
    }
    listSection.replaceChildren();
    const groups: BudgetGroupData[] = month?.budgetGroups ?? [];
    const headerAddBtn = this.querySelector('[data-budget-header-add]');
    if (headerAddBtn) {
      headerAddBtn.toggleAttribute('hidden', !groups.some((g) => g.showAdd));
    }
    for (const group of groups) {
      const groupEl = document.createElement('buddj-budget-group');
      groupEl.setAttribute('hide-recap', '');
      groupEl.setAttribute('hide-inline-add', '');
      if (group.title) groupEl.setAttribute('section-title', group.title);
      if (group.previous) groupEl.setAttribute('previous', '');
      if (group.showAdd) groupEl.setAttribute('show-add', '');
      for (const budget of group.budgets) {
        const cardEl = document.createElement('buddj-budget-card');
        cardEl.setAttribute('name', budget.name);
        cardEl.setAttribute('icon', budget.icon);
        cardEl.setAttribute('allocated', String(budget.allocated));
        if (budget.weeklyBudgetId) cardEl.setAttribute('weekly-budget-id', budget.weeklyBudgetId);
        for (const exp of budget.expenses) {
          const itemEl = document.createElement('buddj-expense-item');
          itemEl.setAttribute('icon', exp.icon);
          itemEl.setAttribute('desc', exp.desc);
          itemEl.setAttribute('amount', String(exp.amount));
          if (exp.id) itemEl.setAttribute('expense-id', exp.id);
          if (exp.taken) itemEl.setAttribute('taken', '');
          cardEl.appendChild(itemEl);
        }
        groupEl.appendChild(cardEl);
      }
      listSection.appendChild(groupEl);
    }
    for (const card of listSection.querySelectorAll('buddj-budget-card')) {
      if (!openKeys.has(openBudgetKey(card))) continue;
      card.querySelector('details.budget-details')?.setAttribute('open', '');
    }
    this._updateBudgetScreenRecap(groups);
    this._syncBudgetHeaderToolbarVisibility();
  }

  private attachListeners(): void {
    this.addEventListener('click', (e) => {
      const target = e.target as Element;
      const headerAdd = target.closest('[data-budget-header-add]');
      if (headerAdd && !headerAdd.hasAttribute('hidden')) {
        e.preventDefault();
        const drawer = document.getElementById('budget-add-drawer') as BuddjBudgetAddDrawerElement;
        drawer?.open();
      }
    });
  }

  private attachExpenseCheckingListener(main: HTMLElement): void {
    main.addEventListener('buddj-expense-taken-change', (e) => {
      if (!this._monthStore) return;
      const ev = e as CustomEvent<Partial<PutExpensesCheckingActionDetail>>;
      const { expenseId, weeklyBudgetId, isChecked } = ev.detail ?? {};
      if (!expenseId || !weeklyBudgetId || isChecked === undefined) return;
      this._monthStore.emitAction('putExpensesChecking', { expenseId, weeklyBudgetId, isChecked });
    });
  }

  private attachExpenseDeleteListener(main: HTMLElement): void {
    main.addEventListener('buddj-expense-delete-confirmed', (e) => {
      if (!this._monthStore) return;
      const ev = e as CustomEvent<Partial<DeleteExpenseActionDetail>>;
      const { expenseId, weeklyBudgetId } = ev.detail ?? {};
      if (!expenseId || !weeklyBudgetId) return;
      this._monthStore.emitAction('deleteExpense', { expenseId, weeklyBudgetId });
    });
  }

  private attachBudgetDeleteListener(main: HTMLElement): void {
    main.addEventListener('buddj-budget-delete-confirmed', (e) => {
      if (!this._monthStore) return;
      const ev = e as CustomEvent<Partial<DeleteBudgetActionDetail>>;
      const budgetId = ev.detail?.budgetId;
      if (!budgetId) return;
      this._monthStore.emitAction('deleteBudget', { budgetId });
    });
  }

  private attachBudgetUpdateListener(main: HTMLElement): void {
    main.addEventListener('buddj-budget-update-confirmed', (e) => {
      if (!this._monthStore) return;
      const ev = e as CustomEvent<Partial<UpdateBudgetActionDetail>>;
      const { budgetId, name } = ev.detail ?? {};
      if (!budgetId || !name?.trim()) return;
      this._monthStore.emitAction('updateBudget', { budgetId, name: name.trim() });
    });
  }

  private attachBudgetTransferListener(main: HTMLElement): void {
    main.addEventListener('buddj-budget-transfer-confirmed', (e) => {
      if (!this._monthStore) return;
      const ev = e as CustomEvent<Partial<TransferFromWeeklyBudgetActionDetail>>;
      const { fromWeeklyBudgetId, destinationType, destinationId, amount } = ev.detail ?? {};
      if (!fromWeeklyBudgetId || !destinationId || !destinationType || amount === undefined || amount <= 0) return;
      this._monthStore.emitAction('transferFromWeeklyBudget', {
        fromWeeklyBudgetId,
        destinationType,
        destinationId,
        amount,
      });
    });
  }
}

customElements.define(BuddjScreenBudgets.tagName, BuddjScreenBudgets);
