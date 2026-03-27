/**
 * Barre récap : date, navigation mois, solde (mode affichage / édition), après charges, transfert.
 * Clic sur le crayon → mode édition (input + icône sauvegarde). Clic sur sauvegarde → valide et revient en affichage.
 * Clic sur l’engrenage à côté de la date → dropdown (Archiver ce mois). Archiver → modal de confirmation puis toast succès.
 */
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import { formatEuros, parseEurosToNumber } from '../../shared/goal.js';
import { escapeHtml } from '../../shared/escape.js';
import type { MonthStore } from '../../application/month/month-store.js';
import type { MonthView } from '../../application/month/month-view.js';
import { getCurrentMonth } from '../../application/month/month-state.js';

export class BuddjSummaryBar extends HTMLElement {
  static readonly tagName = 'buddj-summary-bar';

  private _monthStore?: MonthStore;
  private _getCurrentRouteName?: () => string;
  private _defaultMonthIdForNav = '';
  private _monthListenersBound = false;

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
    this.addEventListener('click', this._onNavMonthClick);
    this._syncFromStoreState();
  }

  connectedCallback(): void {
    if (this.querySelector('.summary-bar')) return;
    this.innerHTML = this.renderFull();
    this.renderBalanceActions();
    this.attachBalanceListeners();
    this.attachDateListeners();
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
      this.renderBalanceActions();
      this.attachBalanceListeners();
    }
    this._updateNavButtonsDisabled();
    this._syncBuddjNavMonthIdFromStore();
  };

  /** Sur la route budgets, aligne `buddj-nav` sur le mois courant du store (lien Charges). */
  private _syncBuddjNavMonthIdFromStore(): void {
    if (this._getCurrentRouteName?.() !== 'budgets') return;
    const nav = document.querySelector('buddj-nav');
    if (!nav || !this._monthStore) return;
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
      this.renderBalanceActions();
      this.attachBalanceListeners();
    }
    this._updateNavButtonsDisabled();
    this._syncBuddjNavMonthIdFromStore();
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
    const empty = months.length === 0;
    if (prev) prev.disabled = empty || currentIndex <= 0;
    if (next) next.disabled = empty || currentIndex >= months.length - 1;
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
      const el = this.querySelector('.summary-after .balance-value--highlight');
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
            <buddj-actions-dropdown position="center">
              <button type="button" class="btn goal-btn-gear" slot="trigger" title="Options du mois" aria-label="Options du mois" aria-haspopup="true">⚙</button>
              <button type="button" slot="items" data-action="archive-month">Archiver ce mois</button>
            </buddj-actions-dropdown>
          </div>
          <button type="button" class="btn btn--nav-month" title="Mois suivant" aria-label="Mois suivant">→</button>
        </div>
        <div class="summary-details">
          <div class="summary-balance">
            <span class="summary-label">Solde actuel</span>
            <div class="summary-balance-actions"></div>
          </div>
          <div class="summary-after">
            <span class="summary-label">Solde prévisionnel</span>
            <span class="balance-value balance-value--highlight">${escapeHtml(this.formatProjectedBalance())}</span>
          </div>
        </div>
      </aside>
    `;
  }

  private attachDateListeners(): void {
    this.addEventListener('buddj-dropdown-action', (e: Event) => {
      const ev = e as CustomEvent<{ actionId: string; targetId: string }>;
      if (ev.detail?.actionId !== 'archive-month') return;
      const confirmModal = document.getElementById('archive-month-confirm') as HTMLElement & { show: (o: unknown) => void };
      if (confirmModal?.show) {
        confirmModal.show({
          title: 'Voulez-vous vraiment archiver ce mois ?',
          cancelLabel: 'Annuler',
          confirmLabel: 'Confirmer',
          onCancel: () => {},
          onConfirm: () => {
            const toast = getToast();
            toast?.show({ message: 'Le mois a bien été archivé' });
          },
        });
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
      <buddj-icon-transfer title="Transférer une partie ou tout le reste vers un budget"></buddj-icon-transfer>
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
          this.setAttribute('balance-value', String(num));
          this.renderBalanceActions();
          this.attachBalanceListeners();
          const toast = getToast();
          toast?.show({ message: 'Le solde a bien été enregistré' });
        },
        onCancel: () => {},
      });
    };

    editBtn?.addEventListener('click', openDrawer);
    balanceEditBtn?.addEventListener('click', openDrawer);

    const transferBtn = container.querySelector('buddj-icon-transfer');
    transferBtn?.addEventListener('click', () => {
      const maxAmount = this.formatProjectedBalance();
      const budgetCards = document.querySelectorAll('#budgets buddj-budget-card');
      const destinations = Array.from(budgetCards).map((card) => ({
        id: card.getAttribute('weekly-budget-id') ?? '',
        label: card.getAttribute('name') ?? 'Budget',
        icon: card.getAttribute('icon') ?? '💰',
        currentAmount: card.getAttribute('remaining') ?? '0 €',
      })).filter((d) => d.id);
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
        onTransfer: () => {},
      });
    });
  }
}

/** `<buddj-summary-bar>` : typage après `querySelector` / appel à `init` depuis le bootstrap. */
export type BuddjSummaryBarElement = BuddjSummaryBar;

customElements.define(BuddjSummaryBar.tagName, BuddjSummaryBar);
