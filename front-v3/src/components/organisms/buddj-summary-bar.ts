/**
 * Barre récap : date, navigation mois, ligne compacte « solde actuel → solde prévisionnel » (édition du solde actuel au clic).
 * Clic sur le menu ⋮ → Rechercher, Transférer, séparateur, Archiver (modal confirmation pour archivage).
 */
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import { formatEuros, parseEurosToNumber } from '../../shared/goal.js';
import { escapeHtml } from '../../shared/escape.js';
import type { MonthStore } from '../../application/month/month-store.js';
import {
  LOADING_ARCHIVE_MONTH_TEXT,
  LOADING_CURRENT_BALANCE_UPDATE_TEXT,
} from '../../application/month/month-store.js';
import type { MonthView } from '../../application/month/month-view.js';
import { getCurrentMonth } from '../../application/month/month-state.js';
import type { BuddjLoadingModal } from '../molecules/buddj-loading-modal.js';

export class BuddjSummaryBar extends HTMLElement {
  static readonly tagName = 'buddj-summary-bar';

  private _monthStore?: MonthStore;
  private _getCurrentRouteName?: () => string;
  private _defaultMonthIdForNav = '';
  private _monthListenersBound = false;
  private _loadingModal?: BuddjLoadingModal;

  static get observedAttributes(): string[] {
    return ['balance-value', 'date', 'projected-balance'];
  }

  init({
    monthStore,
    getCurrentRouteName,
    defaultMonthIdForNav,
  }: {
    monthStore: MonthStore;
    getCurrentRouteName: () => string;
    defaultMonthIdForNav: string;
  }): void {
    this._monthStore = monthStore;
    this._getCurrentRouteName = getCurrentRouteName;
    this._defaultMonthIdForNav = defaultMonthIdForNav;
    if (this._monthListenersBound) return;
    this._monthListenersBound = true;
    this._monthStore.addEventListener('currentMonthChanged', this._onCurrentMonthChanged);
    this._monthStore.addEventListener('currentBalanceUpdateLoading', this._onCurrentBalanceUpdateLoading);
    this._monthStore.addEventListener('currentBalanceUpdateLoaded', this._onCurrentBalanceUpdateLoaded);
    this._monthStore.addEventListener('currentBalanceUpdateFailed', this._onCurrentBalanceUpdateFailed);
    this._monthStore.addEventListener('archiveMonthLoading', this._onArchiveMonthLoading);
    this._monthStore.addEventListener('archiveMonthLoaded', this._onArchiveMonthLoaded);
    this._monthStore.addEventListener('archiveMonthFailed', this._onArchiveMonthFailed);
    this.addEventListener('click', this._onNavMonthClick);
    if (!this._loadingModal) {
      this._loadingModal = document.createElement('buddj-loading-modal') as BuddjLoadingModal;
      this.appendChild(this._loadingModal);
    }
    this._syncFromStoreState();
  }

  connectedCallback(): void {
    if (this.querySelector('.summary-bar')) return;
    this.innerHTML = this.renderFull();
    this.renderBalanceActions();
    this.attachBalanceListeners();
    this.attachSummaryDropdownListeners();
    if (this._monthStore) {
      this._syncFromStoreState();
    }
  }

  private _onCurrentMonthChanged = (e: Event): void => {
    const m = (e as CustomEvent<{ month: MonthView | null }>).detail?.month;
    if (m) {
      this.setAttribute('date', m.displayLabel);
      this.setAttribute('balance-value', String(m.currentBalance));
      this.setAttribute('projected-balance', String(m.projectedBalance));
      this.setAttribute('account-id', m.accountId ?? '');
      this.renderBalanceActions();
      this.attachBalanceListeners();
    } else {
      this.setAttribute('date', '');
      this.setAttribute('balance-value', '0');
      this.setAttribute('projected-balance', '0');
      this.removeAttribute('account-id');
      this.renderBalanceActions();
      this.attachBalanceListeners();
    }
    this._toggleMonthOptionsMenu(!!m);
    this._toggleVisibilityWhenNoMonthsInStore();
    this._updateNavButtonsDisabled();
    this._syncBuddjNavMonthIdFromStore();
    this._updateMonthSearchVisibility();
  };

  /** Masque la barre récap lorsqu’il n’y a aucun mois dans le store. */
  private _toggleVisibilityWhenNoMonthsInStore(): void {
    if (!this._monthStore) return;
    const { months } = this._monthStore.getState();
    this.toggleAttribute('hidden', months === null || months.length === 0);
  }

  /** Aligne `buddj-nav` (liens Charges / Budgets) sur le mois courant du store (toute route : ex. mois archivés après désarchivage). */
  private _syncBuddjNavMonthIdFromStore(): void {
    const nav = document.querySelector('buddj-nav');
    if (!nav || !this._monthStore) return;
    const { months } = this._monthStore.getState();
    if (months === null || months.length === 0) return;
    const id = this._monthStore.getCurrentMonthIdForNav() || this._defaultMonthIdForNav;
    nav.setAttribute('month-id', id);
  }

  private _syncFromStoreState(): void {
    if (!this._monthStore) return;
    const m = getCurrentMonth({ state: this._monthStore.getState() });
    if (m) {
      this.setAttribute('date', m.displayLabel);
      this.setAttribute('balance-value', String(m.currentBalance));
      this.setAttribute('projected-balance', String(m.projectedBalance));
      this.setAttribute('account-id', m.accountId ?? '');
      this.renderBalanceActions();
      this.attachBalanceListeners();
    } else {
      this.setAttribute('date', '');
      this.setAttribute('balance-value', '0');
      this.setAttribute('projected-balance', '0');
      this.removeAttribute('account-id');
      this.renderBalanceActions();
      this.attachBalanceListeners();
    }
    this._toggleMonthOptionsMenu(!!m);
    this._toggleVisibilityWhenNoMonthsInStore();
    this._updateNavButtonsDisabled();
    this._syncBuddjNavMonthIdFromStore();
    this._updateMonthSearchVisibility();
  }

  /** À appeler après navigation (Charges / Budgets) pour afficher ou masquer la loupe. */
  syncSearchFromRoute(): void {
    this._updateMonthSearchVisibility();
  }

  private _updateMonthSearchVisibility(): void {
    const btn = this.querySelector('.summary-month-actions-dropdown [data-action="summary-search"]');
    if (!btn || !this._getCurrentRouteName || !this._monthStore) return;
    const month = getCurrentMonth({ state: this._monthStore.getState() });
    const route = this._getCurrentRouteName();
    const show =
      !!month &&
      (route === 'outflows' || route === 'budgets-month' || route === 'budgets');
    btn.toggleAttribute('hidden', !show);
  }

  private _toggleMonthOptionsMenu(visible: boolean): void {
    const dropdown = this.querySelector('buddj-actions-dropdown');
    dropdown?.toggleAttribute('hidden', !visible);
  }

  private _onNavMonthClick = (e: Event): void => {
    const btn = (e.target as Element).closest('.btn--nav-month');
    if (!btn || !this._monthStore) return;
    const row = this.querySelector('.summary-date-row');
    const buttons = row ? Array.from(row.querySelectorAll('.btn--nav-month')) : [];
    const idx = buttons.indexOf(btn as HTMLButtonElement);
    if (idx === 0) this._monthStore.emitAction('goToPreviousMonth');
    else if (idx === 1) this._monthStore.emitAction('goToNextMonth');
  };

  private _updateNavButtonsDisabled(): void {
    if (!this._monthStore) return;
    const { months, currentIndex } = this._monthStore.getState();
    const row = this.querySelector('.summary-date-row');
    if (!row) return;
    const buttons = row.querySelectorAll('.btn--nav-month');
    const prev = buttons[0] as HTMLButtonElement | undefined;
    const next = buttons[1] as HTMLButtonElement | undefined;
    const len = months?.length ?? 0;
    const empty = months === null || len === 0;
    if (prev) prev.disabled = empty || currentIndex <= 0;
    if (next) next.disabled = empty || currentIndex >= len - 1;
  }

  attributeChangedCallback(name: string, _old: string | null, newValue: string | null): void {
    if (!this.innerHTML) return;
    const val = newValue ?? '';
    if (name === 'balance-value') {
      const el = this.querySelector('.summary-balance-actions .balance-value');
      if (el) el.textContent = formatEuros(parseEurosToNumber(val));
    } else if (name === 'date') {
      const el = this.querySelector('.summary-date');
      if (el) el.textContent = val || this.date;
    } else if (name === 'projected-balance') {
      const el = this.querySelector('.summary-balances-projected');
      if (el) el.textContent = formatEuros(parseEurosToNumber(val));
    }
  }

  /** Montant formaté pour affichage (solde actuel). */
  private formatBalanceValue(): string {
    return formatEuros(parseEurosToNumber(this.getAttribute('balance-value') ?? '0'));
  }

  private get date(): string {
    return this.getAttribute('date') ?? '';
  }

  /** Montant formaté pour affichage (solde prévisionnel). */
  private formatProjectedBalance(): string {
    return formatEuros(parseEurosToNumber(this.getAttribute('projected-balance') ?? '0'));
  }

  private renderFull(): string {
    return `
      <aside class="summary-bar" aria-label="Résumé du mois">
        <div class="summary-date-row">
          <button type="button" class="btn btn--nav-month" title="Mois précédent" aria-label="Mois précédent">←</button>
          <div class="summary-date-wrap">
            <span class="summary-date">${escapeHtml(this.date)}</span>
            <buddj-actions-dropdown position="center" class="summary-month-actions-dropdown">
              <button type="button" class="btn btn-menu-dots" slot="trigger" title="Options du mois" aria-label="Options du mois" aria-haspopup="true">⋮</button>
              <button type="button" slot="items" data-action="summary-search" title="Rechercher dans les charges ou les budgets" aria-label="Rechercher dans les charges ou les budgets" hidden>Rechercher</button>
              <button type="button" slot="items" data-action="summary-transfer" title="Transférer une partie ou tout le reste vers un budget">Transférer</button>
              <hr slot="items" class="dropdown-menu-separator" aria-hidden="true" />
              <button type="button" slot="items" data-action="archive-month" data-variant="danger">Archiver</button>
            </buddj-actions-dropdown>
          </div>
          <button type="button" class="btn btn--nav-month" title="Mois suivant" aria-label="Mois suivant">→</button>
        </div>
        <div class="summary-details">
          <div class="summary-amounts-inline" role="group" aria-label="Soldes du mois">
            <div class="summary-balance-actions"></div>
            <span class="summary-amounts-sep" aria-hidden="true">→</span>
            <span class="balance-value balance-value--highlight summary-balances-projected" title="Solde prévisionnel">${escapeHtml(this.formatProjectedBalance())}</span>
          </div>
        </div>
      </aside>
    `;
  }

  private attachSummaryDropdownListeners(): void {
    this.addEventListener('buddj-dropdown-action', (e: Event) => {
      const ev = e as CustomEvent<{ actionId: string; targetId: string }>;
      const actionId = ev.detail?.actionId;
      if (actionId === 'summary-search') {
        const drawer = document.getElementById('month-search-drawer') as HTMLElement & { open: () => void } | null;
        drawer?.open();
        return;
      }
      if (actionId === 'summary-transfer') {
        this._openAccountTransferDrawer();
        return;
      }
      if (actionId === 'archive-month') {
        const confirmModal = document.getElementById('archive-month-confirm') as HTMLElement & { show: (o: unknown) => void };
        if (confirmModal?.show) {
          confirmModal.show({
            title: 'Voulez-vous vraiment archiver ce mois ?',
            cancelLabel: 'Annuler',
            confirmLabel: 'Confirmer',
            onCancel: () => {},
            onConfirm: () => {
              const monthId = this._monthStore ? getCurrentMonth({ state: this._monthStore.getState() })?.id : '';
              if (!monthId) return;
              this._monthStore?.emitAction('archiveMonth', { monthId });
            },
          });
        }
      }
    });
  }

  private renderBalanceActions(): void {
    const container = this.querySelector('.summary-balance-actions');
    if (!container) return;

    container.innerHTML = `
      <button type="button" class="balance-edit" title="Cliquer pour modifier le solde actuel">
        <span class="balance-value">${escapeHtml(this.formatBalanceValue())}</span>
      </button>
    `;
  }

  private attachBalanceListeners(): void {
    const container = this.querySelector('.summary-balance-actions');
    if (!container) return;

    const editBtn = container.querySelector('buddj-icon-edit');
    const balanceEditBtn = container.querySelector('.balance-edit');
    const openDrawer = (): void => {
      const drawer = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
      drawer?.open({
        initialValue: this.formatBalanceValue(),
        startWithInitialValue: true,
        onValidate: (value: string) => {
          const num = parseEurosToNumber(value);
          this._monthStore?.emitAction('updateCurrentBalance', { currentBalance: num });
        },
        onCancel: () => {},
      });
    };

    editBtn?.addEventListener('click', openDrawer);
    balanceEditBtn?.addEventListener('click', openDrawer);
  }

  private _openAccountTransferDrawer(): void {
    const maxAmount = this.formatProjectedBalance();
    const sourceAccountId = this.getAttribute('account-id') ?? '';
    if (!sourceAccountId) return;
    const month = this._monthStore ? getCurrentMonth({ state: this._monthStore.getState() }) : null;
    const destinations =
      month?.budgetGroups
        ?.flatMap((group) => group.budgets)
        .map((budget) => {
          const expensesTotal = budget.expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
          const remaining = budget.allocated - expensesTotal;
          return {
            id: budget.weeklyBudgetId,
            label: budget.name || 'Budget',
            icon: budget.icon || '💰',
            currentAmount: formatEuros(remaining),
          };
        })
        .filter(
          (
            destination
          ): destination is { id: string; label: string; icon: string; currentAmount: string } =>
            Boolean(destination.id)
        )
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })) ?? [];
    if (destinations.length === 0) return;
    const drawer = document.getElementById('transfer-drawer') as HTMLElement & {
      open: (o: {
        source: 'outflows' | 'budget';
        maxAmount: string;
        maxLabel: string;
        destinations: { id: string; label: string; icon?: string; currentAmount: string }[];
        onTransfer: (amount: string, destinationId: string) => void;
      }) => void;
    };
    drawer?.open({
      source: 'outflows',
      maxAmount,
      maxLabel: 'Solde prévisionnel',
      destinations,
      onTransfer: (amount: string, destinationId: string) => {
        const parsedAmount = parseEurosToNumber(amount);
        if (!destinationId || parsedAmount <= 0) return;
        this.dispatchEvent(
          new CustomEvent('buddj-account-transfer-confirmed', {
            bubbles: true,
            composed: true,
            detail: {
              fromAccountId: sourceAccountId,
              toWeeklyBudgetId: destinationId,
              amount: parsedAmount,
            },
          }),
        );
      },
    });
  }

  private _onCurrentBalanceUpdateLoading = (): void => {
    this._loadingModal?.show(LOADING_CURRENT_BALANCE_UPDATE_TEXT);
  };

  private _onCurrentBalanceUpdateLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'Le solde a bien été enregistré' });
  };

  private _onCurrentBalanceUpdateFailed = (e: Event): void => {
    this._loadingModal?.hide();
    const msg = (e as CustomEvent<{ message: string }>).detail?.message ?? 'Erreur lors de la mise à jour du solde';
    getToast()?.show({ message: msg, variant: 'error', durationMs: 3000 });
  };

  private _onArchiveMonthLoading = (): void => {
    this._loadingModal?.show(LOADING_ARCHIVE_MONTH_TEXT);
  };

  private _onArchiveMonthLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'Le mois a bien été archivé' });
  };

  private _onArchiveMonthFailed = (e: Event): void => {
    this._loadingModal?.hide();
    const msg = (e as CustomEvent<{ message: string }>).detail?.message ?? 'Erreur lors de l’archivage du mois';
    getToast()?.show({ message: msg, variant: 'error', durationMs: 3000 });
  };
}

/** `<buddj-summary-bar>` : typage après `querySelector` / appel à `init` depuis le bootstrap. */
export type BuddjSummaryBarElement = BuddjSummaryBar;

customElements.define(BuddjSummaryBar.tagName, BuddjSummaryBar);
