/**
 * Écran « Suivi des épargnes » : pour un compte épargne (flèches ← → pour changer de compte),
 * ce qui a été ajouté et retiré sur une période (raccourcis ou calendrier, comme le suivi des
 * dépenses), le net et le solde, puis la courbe du solde.
 */
import {
  getCurrentSavingsAccount,
  type SavingsAccountsStore,
} from '../../application/savings-account/savings-accounts-store.js';
import type { SavingsTrackerStore } from '../../application/savings-account/savings-tracker-store.js';
import { savingsChartPoints } from '../../application/savings-account/savings-tracker-series.js';
import type { SavingsTrackerView } from '../../application/savings-account/savings-account-types.js';
import { rangeForShortcut, todayIso } from '../../application/spending-tracker/spending-tracker-range.js';
import type { SpendingRange, SpendingRangeShortcut } from '../../application/spending-tracker/spending-tracker-types.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';
import { formatDaySpanLabel } from '../../shared/spending-bucket-label.js';
import '../organisms/buddj-savings-account-switcher.js';
import type { BuddjSavingsAccountSwitcher } from '../organisms/buddj-savings-account-switcher.js';
import '../organisms/buddj-savings-tracker-chart.js';
import type { BuddjSavingsTrackerChart } from '../organisms/buddj-savings-tracker-chart.js';
import '../organisms/buddj-date-range-picker-drawer.js';
import type { BuddjDateRangePickerDrawerElement } from '../organisms/buddj-date-range-picker-drawer.js';

const DEFAULT_SHORTCUT: SpendingRangeShortcut = 'month';

/** Seul raccourci utile ici : le mois en cours ; le reste passe par le calendrier. */
const SHORTCUTS: Array<{ value: SpendingRangeShortcut; label: string }> = [{ value: 'month', label: 'Ce mois' }];

function signedEuros(value: number): string {
  if (value > 0) return `+ ${formatEuros(value)}`;
  if (value < 0) return `− ${formatEuros(-value)}`;
  return formatEuros(0);
}

export class BuddjScreenSavingsTracker extends HTMLElement {
  static readonly tagName = 'buddj-screen-savings-tracker';

  private _accountsStore?: SavingsAccountsStore;
  private _trackerStore?: SavingsTrackerStore;
  private _main?: HTMLElement;
  /** Plage en cours, gardée pour la rejouer quand on change de compte */
  private _range: SpendingRange | null = null;
  private _shortcut: SpendingRangeShortcut | null = DEFAULT_SHORTCUT;
  /** Le suivi est rechargé à chaque ouverture de l'écran, une fois les comptes connus. */
  private _needsLoad = true;

  init({
    savingsAccountsStore,
    savingsTrackerStore,
  }: {
    savingsAccountsStore: SavingsAccountsStore;
    savingsTrackerStore: SavingsTrackerStore;
  }): void {
    this._accountsStore = savingsAccountsStore;
    this._trackerStore = savingsTrackerStore;
  }

  connectedCallback(): void {
    const accountsStore = this._accountsStore;
    const trackerStore = this._trackerStore;
    if (!accountsStore || !trackerStore || this._main) return;

    const main = document.createElement('main');
    this._main = main;
    main.id = 'savings-tracker';
    main.className = 'screen screen--spending-tracker screen--savings-tracker';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap spending-tracker-sticky-wrap">
        <header class="screen-header">
          <h1 class="title">Suivi des épargnes</h1>
        </header>
        <buddj-savings-account-switcher hidden></buddj-savings-account-switcher>
      </div>
      <div class="spending-tracker-content">
        <form class="spending-tracker-filters" aria-label="Filtres du suivi des épargnes" novalidate>
          <fieldset class="spending-tracker-fieldset spending-tracker-shortcuts">
            <legend class="spending-tracker-legend">Période</legend>
            ${SHORTCUTS.map(
              (s) => `
            <label class="spending-tracker-chip">
              <input type="radio" name="savings-shortcut" value="${s.value}">
              <span>${escapeHtml(s.label)}</span>
            </label>`
            ).join('')}
          </fieldset>
          <button type="button" class="spending-tracker-range-button" aria-haspopup="dialog">
            <span class="spending-tracker-range-icon" aria-hidden="true">📅</span>
            <span class="spending-tracker-range-text">Choisir des dates</span>
          </button>
        </form>
        <section class="spending-tracker-results" aria-label="Résultats du suivi des épargnes">
          <p class="spending-tracker-loading" hidden>Chargement du suivi…</p>
          <div class="spending-tracker-error" role="alert" hidden>
            <p class="spending-tracker-error-text">Impossible d’afficher ton suivi pour le moment. Vérifie ta connexion puis réessaie.</p>
            <button type="button" class="btn spending-tracker-retry">Réessayer</button>
          </div>
          <p class="savings-tracker-none" hidden>Aucun compte épargne pour le moment.</p>
          <dl class="savings-tracker-totals" hidden></dl>
          <buddj-savings-tracker-chart hidden></buddj-savings-tracker-chart>
        </section>
      </div>
      <buddj-date-range-picker-drawer></buddj-date-range-picker-drawer>
    `;
    this.appendChild(main);

    main.addEventListener('change', this._onChange);
    main.addEventListener('click', this._onClick);
    main.addEventListener('savings-account-previous', this._onPrevious);
    main.addEventListener('savings-account-next', this._onNext);
    main.querySelector('form')?.addEventListener('submit', this._onSubmit);
    accountsStore.addEventListener('savingsAccountsStateUpdated', this._onAccountsUpdated);
    trackerStore.addEventListener('savingsTrackerStateUpdated', this._onTrackerUpdated);

    const { range, shortcut } = trackerStore.getState();
    if (range) {
      this._range = range;
      this._shortcut = shortcut;
    }
    this._needsLoad = true;
    accountsStore.emitAction('loadSavingsAccounts');
    this._render();
  }

  disconnectedCallback(): void {
    const main = this._main;
    if (main) {
      main.removeEventListener('change', this._onChange);
      main.removeEventListener('click', this._onClick);
      main.removeEventListener('savings-account-previous', this._onPrevious);
      main.removeEventListener('savings-account-next', this._onNext);
      main.querySelector('form')?.removeEventListener('submit', this._onSubmit);
      main.remove();
    }
    this._accountsStore?.removeEventListener('savingsAccountsStateUpdated', this._onAccountsUpdated);
    this._trackerStore?.removeEventListener('savingsTrackerStateUpdated', this._onTrackerUpdated);
    this._main = undefined;
  }

  private _currentAccountId(): string | null {
    const store = this._accountsStore;
    return store ? (getCurrentSavingsAccount({ state: store.getState() })?.id ?? null) : null;
  }

  /** Recharge le suivi du compte affiché ; les raccourcis sont recalculés à partir d'aujourd'hui. */
  private _requestLoad(): void {
    const savingsAccountId = this._currentAccountId();
    if (!savingsAccountId) return;
    const range = this._shortcut ? rangeForShortcut({ shortcut: this._shortcut, today: todayIso() }) : this._range;
    if (!range) return;
    this._range = range;
    this._trackerStore?.emitAction('loadSavingsTracker', { ...range, shortcut: this._shortcut, savingsAccountId });
  }

  private _onAccountsUpdated = (): void => {
    const accountsState = this._accountsStore?.getState();
    const current = this._currentAccountId();
    // Une fois les comptes chargés (à l'ouverture) ou quand on change de compte, le suivi suit le compte affiché.
    if (accountsState && !accountsState.isLoading && current) {
      const loadedFor = this._trackerStore?.getState().savingsAccountId;
      if (this._needsLoad || current !== loadedFor) {
        this._needsLoad = false;
        this._requestLoad();
      }
    }
    this._render();
  };

  private _onTrackerUpdated = (): void => this._render();

  private _onPrevious = (): void => this._accountsStore?.emitAction('goToPreviousSavingsAccount');

  private _onNext = (): void => this._accountsStore?.emitAction('goToNextSavingsAccount');

  private _onSubmit = (e: Event): void => e.preventDefault();

  private _onChange = (e: Event): void => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.name !== 'savings-shortcut') return;
    this._shortcut = input.value as SpendingRangeShortcut;
    this._requestLoad();
  };

  private _onClick = (e: Event): void => {
    const target = e.target as Element;
    if (target.closest('.spending-tracker-range-button')) {
      const picker = this._main!.querySelector('buddj-date-range-picker-drawer') as BuddjDateRangePickerDrawerElement;
      picker.open({
        range: this._range,
        today: todayIso(),
        onValidate: (range) => {
          this._range = range;
          this._shortcut = null;
          this._requestLoad();
        },
      });
      return;
    }
    if (target.closest('.spending-tracker-retry')) {
      if (this._accountsStore?.getState().loadErrorMessage) this._accountsStore.emitAction('loadSavingsAccounts');
      else this._requestLoad();
    }
  };

  private _render(): void {
    const main = this._main;
    const accountsStore = this._accountsStore;
    const trackerStore = this._trackerStore;
    if (!main || !accountsStore || !trackerStore) return;
    const accountsState = accountsStore.getState();
    const account = getCurrentSavingsAccount({ state: accountsState });
    const { view, isLoading, loadErrorMessage, savingsAccountId } = trackerStore.getState();

    main.querySelectorAll<HTMLInputElement>('input[name="savings-shortcut"]').forEach((radio) => {
      radio.checked = radio.value === this._shortcut;
    });
    const rangeButton = main.querySelector('.spending-tracker-range-button') as HTMLButtonElement;
    const rangeLabel = this._range ? formatDaySpanLabel(this._range) : 'Choisir des dates';
    (rangeButton.querySelector('.spending-tracker-range-text') as HTMLElement).textContent = rangeLabel;
    rangeButton.setAttribute('aria-label', `Dates : ${rangeLabel}`);
    rangeButton.classList.toggle('spending-tracker-range-button--custom', this._range !== null && this._shortcut === null);

    const switcher = main.querySelector('buddj-savings-account-switcher') as BuddjSavingsAccountSwitcher;
    switcher.hidden = account === null;
    if (account && accountsState.accounts) {
      switcher.render({
        name: account.name,
        amount: null,
        hasPrevious: accountsState.currentIndex > 0,
        hasNext: accountsState.currentIndex < accountsState.accounts.length - 1,
      });
    }

    const accountsFailed = accountsState.loadErrorMessage !== null && !accountsState.isLoading;
    (main.querySelector('.spending-tracker-loading') as HTMLElement).hidden = !(
      isLoading || (accountsState.isLoading && accountsState.accounts === null)
    );
    (main.querySelector('.spending-tracker-error') as HTMLElement).hidden = !(
      accountsFailed || (loadErrorMessage && !isLoading)
    );
    (main.querySelector('.savings-tracker-none') as HTMLElement).hidden = !(
      accountsState.accounts && accountsState.accounts.length === 0
    );

    const shown = view && !loadErrorMessage && account && savingsAccountId === account.id ? view : null;
    this._renderTotals({ main, view: shown });
    const chart = main.querySelector('buddj-savings-tracker-chart') as BuddjSavingsTrackerChart;
    chart.hidden = shown === null;
    if (shown) {
      chart.render({
        points: savingsChartPoints({ view: shown }),
        granularity: shown.granularity,
        isRefreshing: isLoading,
      });
    }
  }

  private _renderTotals({ main, view }: { main: HTMLElement; view: SavingsTrackerView | null }): void {
    const totals = main.querySelector('.savings-tracker-totals') as HTMLElement;
    totals.hidden = view === null;
    if (!view) {
      totals.innerHTML = '';
      return;
    }
    const rows: Array<{ label: string; value: string; modifier: string }> = [
      { label: 'Ajouté', value: `+ ${formatEuros(view.depositsTotal)}`, modifier: 'deposit' },
      { label: 'Retiré', value: `− ${formatEuros(view.withdrawalsTotal)}`, modifier: 'withdrawal' },
      { label: 'Net sur la période', value: signedEuros(view.net), modifier: view.net < 0 ? 'withdrawal' : 'deposit' },
      { label: 'Solde en fin de période', value: formatEuros(view.closingBalance), modifier: 'balance' },
    ];
    totals.innerHTML = rows
      .map(
        (row) => `
        <div class="savings-tracker-total savings-tracker-total--${row.modifier}" role="group" aria-label="${escapeAttr(`${row.label} : ${row.value}`)}">
          <dt>${escapeHtml(row.label)}</dt>
          <dd>${escapeHtml(row.value)}</dd>
        </div>`
      )
      .join('');
  }
}

customElements.define(BuddjScreenSavingsTracker.tagName, BuddjScreenSavingsTracker);
