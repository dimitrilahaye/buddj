/**
 * Écran Mes budgets : charge les mois non archivés, barre récap + liste depuis MonthStore.
 */
import type { BuddjExpenseSearchDrawerElement } from '../organisms/buddj-expense-search-drawer.js';
import {
  LOADING_DELETE_EXPENSE_TEXT,
  LOADING_EXPENSES_CHECKING_TEXT,
  type DeleteExpenseActionDetail,
  type MonthStore,
  type PutExpensesCheckingActionDetail,
} from '../../application/month/month-store.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjLoadingModal } from '../molecules/buddj-loading-modal.js';
import type { MonthView } from '../../application/month/month-view.js';
import type { BudgetGroupData } from '../../application/month/month-types.js';

const LOADING_MONTHS_TEXT = 'Chargement des mois en cours';

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
            <buddj-icon-search title="Rechercher par intitulé ou montant" aria-label="Ouvrir la recherche"></buddj-icon-search>
            <buddj-toggle-all target-selector=".budget-details" title-expand="Déplier tous les budgets" title-collapse="Replier tous les budgets"></buddj-toggle-all>
          </div>
        </header>
      </div>
      <section class="budget-list"></section>
    `;
    this.appendChild(main);
    this.attachListeners();
    this.attachExpenseCheckingListener(main);
    this.attachExpenseDeleteListener(main);
    if (this._monthStore && !this._monthListenersAttached) {
      this._attachMonthStoreListeners();
      this._monthStore.emitAction('loadUnarchivedMonths');
    }
  }

  disconnectedCallback(): void {
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

  private _onCurrentMonthChanged = (e: Event): void => {
    const ev = e as CustomEvent<{ month: MonthView | null }>;
    this._renderBudgetGroups(ev.detail?.month ?? null);
  };

  private _renderBudgetGroups(month: MonthView | null): void {
    const listSection = this.querySelector('.budget-list');
    if (!listSection) return;
    const openKeys = new Set<string>();
    for (const card of listSection.querySelectorAll('buddj-budget-card')) {
      const details = card.querySelector('details.budget-details') as HTMLDetailsElement | null;
      if (details?.open) openKeys.add(openBudgetKey(card));
    }
    listSection.replaceChildren();
    const groups: BudgetGroupData[] = month?.budgetGroups ?? [];
    for (const group of groups) {
      const groupEl = document.createElement('buddj-budget-group');
      groupEl.setAttribute('title', group.title);
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
  }

  private attachListeners(): void {
    this.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (target.closest('buddj-icon-search')) {
        e.preventDefault();
        const drawer = document.getElementById('expense-search-drawer') as BuddjExpenseSearchDrawerElement;
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
}

customElements.define(BuddjScreenBudgets.tagName, BuddjScreenBudgets);
