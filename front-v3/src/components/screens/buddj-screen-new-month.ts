/**
 * Écran « Créer un nouveau mois » : GET /months/template/default, GET yearly-outflows,
 * formulaire local, POST /months à la validation.
 */
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import type { BuddjBudgetAddDrawerElement, BudgetChargeDrawerOnValidate } from '../organisms/buddj-budget-add-drawer.js';
import type { BuddjNewMonthChargeSearchDrawerElement } from '../organisms/buddj-new-month-charge-search-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from '../organisms/buddj-calculator-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros, parseEurosToNumber } from '../../shared/goal.js';
import { splitLeadingEmoji } from '../../shared/emoji-label.js';
import type { TemplateService } from '../../application/template/template-service.js';
import type { MonthStore } from '../../application/month/month-store.js';
import type { YearlyOutflowsStore } from '../../application/yearly-outflows/yearly-outflows-store.js';
import {
  buildCreateMonthApiBody,
  computeNewMonthProjectedBalance,
} from '../../application/new-month/default-new-month-bundle.js';
import type { PendingExpenseForNewMonth } from '../../application/new-month/default-new-month-bundle.js';

const CURRENT_YEAR = new Date().getFullYear();

function toMonthValue(month: number, year: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function fromMonthValue(value: string): { month: number; year: number } {
  const [y, m] = value.split('-').map(Number);
  return { month: (m ?? 1) - 1, year: y ?? CURRENT_YEAR };
}

function firstDayIsoUtc({ month, year }: { month: number; year: number }): string {
  return new Date(Date.UTC(year, month, 1, 12, 0, 0, 0)).toISOString();
}

function formatAmount(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function labelForApi(icon: string, label: string): string {
  const t = label.trim();
  if (!t) return icon;
  return `${icon} ${t}`.trim();
}

interface ChargeRow {
  id: string;
  icon: string;
  label: string;
  amount: number;
  includedInProjected: boolean;
}

interface BudgetRow {
  id: string;
  icon: string;
  label: string;
  amount: number;
  includedInProjected: boolean;
}

interface PendingChargeRow {
  id: string;
  icon: string;
  label: string;
  amount: number;
  pendingFrom: string;
}

interface PendingBudgetRow {
  id: string;
  icon: string;
  label: string;
  initialBalance: number;
  currentBalance: number;
  pendingFrom: string;
  expenses: PendingExpenseForNewMonth[];
}

interface YearlyOutRow {
  id: string;
  icon: string;
  label: string;
  amount: number;
}

interface YearlyBudgetRow {
  id: string;
  icon: string;
  name: string;
  initialBalance: number;
}

export type BuddjScreenNewMonthInit = {
  templateService: TemplateService;
  monthStore: MonthStore;
  yearlyOutflowsStore: YearlyOutflowsStore;
  navigateToPath: (path: string) => void;
};

export class BuddjScreenNewMonth extends HTMLElement {
  static readonly tagName = 'buddj-screen-new-month';

  private _templateService: TemplateService | null = null;
  private _monthStore: MonthStore | null = null;
  private _yearlyOutflowsStore: YearlyOutflowsStore | null = null;
  private _navigateToPath: ((path: string) => void) | null = null;

  private _month = new Date().getMonth();
  private _year = CURRENT_YEAR;
  private _initialBalance = '';
  private _charges: ChargeRow[] = [];
  private _budgets: BudgetRow[] = [];
  private _yearlyOutflows: YearlyOutRow[] = [];
  private _yearlyBudgets: YearlyBudgetRow[] = [];
  private _pendingCharges: PendingChargeRow[] = [];
  private _pendingBudgets: PendingBudgetRow[] = [];
  private _rappelAnnuelIncluded = true;
  private _rappelChargesIncluded = true;
  private _rappelBudgetsIncluded = true;
  private _noDefaultTemplate = false;
  private _loadError: string | null = null;
  private _loading = true;
  private _submitting = false;
  private _unsubYearly: (() => void) | null = null;
  private _onMonthCreated = (e: Event): void => {
    const d = (e as CustomEvent<{ monthId: string }>).detail;
    if (d?.monthId && this._navigateToPath) {
      getToast()?.show({ message: 'Votre mois a bien été créé !' });
      this._navigateToPath(`/budgets/${d.monthId}`);
    }
  };
  private _onCreateFailed = (e: Event): void => {
    const d = (e as CustomEvent<{ message: string }>).detail;
    this._submitting = false;
    getToast()?.show({
      message: d?.message ?? 'Impossible de créer le mois',
      variant: 'error',
    });
    this.render();
    this.attachListeners();
  };

  init(input: BuddjScreenNewMonthInit): void {
    this._templateService = input.templateService;
    this._monthStore = input.monthStore;
    this._yearlyOutflowsStore = input.yearlyOutflowsStore;
    this._navigateToPath = input.navigateToPath;
  }

  connectedCallback(): void {
    this.open();
  }

  disconnectedCallback(): void {
    this._teardownMonthStoreListeners();
    this._unsubYearly?.();
    this._unsubYearly = null;
  }

  private _teardownMonthStoreListeners(): void {
    const s = this._monthStore;
    if (!s) return;
    s.removeEventListener('monthCreated', this._onMonthCreated);
    s.removeEventListener('createMonthFailed', this._onCreateFailed);
  }

  open(): void {
    this._unsubYearly?.();
    this._unsubYearly = null;
    this._month = new Date().getMonth();
    this._year = CURRENT_YEAR;
    this._initialBalance = '';
    this._charges = [];
    this._budgets = [];
    this._yearlyOutflows = [];
    this._yearlyBudgets = [];
    this._pendingCharges = [];
    this._pendingBudgets = [];
    this._rappelAnnuelIncluded = true;
    this._rappelChargesIncluded = true;
    this._rappelBudgetsIncluded = true;
    this._noDefaultTemplate = false;
    this._loadError = null;
    this._loading = true;
    this._submitting = false;
    void this._loadScreenData();
  }

  close(): void {
    this.classList.remove('new-month-screen--open');
  }

  private async _loadScreenData(): Promise<void> {
    const templateService = this._templateService;
    const yearlyStore = this._yearlyOutflowsStore;
    if (!templateService || !yearlyStore) {
      this._loading = false;
      this._loadError = 'Configuration incomplète';
      this.render();
      return;
    }

    this._unsubYearly?.();
    this._unsubYearly = null;

    yearlyStore.emitAction('loadYearlyOutflows');
    const onYearly = (): void => {
      this._applyYearlySliceFromStore();
      if (!this._loading) {
        this.render();
        this.attachListeners();
        this._updateProjectedOnly();
      }
    };
    yearlyStore.addEventListener('yearlyOutflowsLoaded', onYearly);
    yearlyStore.addEventListener('yearlyOutflowsStateUpdated', onYearly);
    this._unsubYearly = () => {
      yearlyStore.removeEventListener('yearlyOutflowsLoaded', onYearly);
      yearlyStore.removeEventListener('yearlyOutflowsStateUpdated', onYearly);
    };

    try {
      const bundle = await templateService.getDefaultForNewMonth();
      if (bundle.template === null) {
        this._noDefaultTemplate = true;
        this._charges = [];
        this._budgets = [];
        this._pendingCharges = [];
        this._pendingBudgets = [];
      } else {
        this._noDefaultTemplate = false;
        const t = bundle.template;
        this._initialBalance = formatEuros(Number(t.startingBalance));
        const ref = new Date(t.month);
        if (!Number.isNaN(ref.getTime())) {
          this._month = ref.getUTCMonth();
          this._year = ref.getUTCFullYear();
        }
        this._charges = t.outflows.map((o) => {
          const { icon, text } = splitLeadingEmoji({ label: o.label, defaultIcon: '💰' });
          return {
            id: o.id,
            icon,
            label: text,
            amount: o.amount,
            includedInProjected: true,
          };
        });
        this._budgets = t.budgets.map((b) => {
          const { icon, text } = splitLeadingEmoji({ label: b.name, defaultIcon: '💰' });
          return {
            id: b.id,
            icon,
            label: text,
            amount: b.initialBalance,
            includedInProjected: true,
          };
        });
        this._pendingCharges = bundle.pendingDebits.outflows.map((o) => {
          const { icon, text } = splitLeadingEmoji({ label: o.label, defaultIcon: '💰' });
          return {
            id: o.id,
            icon,
            label: text,
            amount: o.amount,
            pendingFrom: o.pendingFrom,
          };
        });
        this._pendingBudgets = bundle.pendingDebits.budgets.map((b) => {
          const { icon, text } = splitLeadingEmoji({ label: b.name, defaultIcon: '💰' });
          return {
            id: b.id,
            icon,
            label: text,
            initialBalance: b.initialBalance,
            currentBalance: b.currentBalance,
            pendingFrom: b.pendingFrom,
            expenses: b.expenses.map((e) => ({ ...e })),
          };
        });
      }
      this._applyYearlySliceFromStore();
    } catch (err) {
      this._loadError = err instanceof Error ? err.message : String(err);
    } finally {
      this._loading = false;
      this.classList.add('new-month-screen--open');
      this.render();
      this.attachListeners();
    }
  }

  private _applyYearlySliceFromStore(): void {
    const store = this._yearlyOutflowsStore;
    if (!store) return;
    const slice = store.getState().view.months[this._month];
    if (!slice) {
      this._yearlyOutflows = [];
      this._yearlyBudgets = [];
      return;
    }
    this._yearlyOutflows = slice.outflows.map((o) => ({
      id: o.id,
      icon: '📅',
      label: o.label,
      amount: o.amount,
    }));
    this._yearlyBudgets = slice.budgets.map((b) => ({
      id: b.id,
      icon: '📅',
      name: b.name,
      initialBalance: b.initialBalance,
    }));
  }

  private getProjectedBalance(): number {
    const initial = parseEurosToNumber(this._initialBalance);
    return computeNewMonthProjectedBalance({
      startingBalanceEuros: initial,
      templateCharges: this._charges.map((c) => ({
        amount: c.amount,
        includedInProjected: c.includedInProjected,
      })),
      templateBudgets: this._budgets.map((b) => ({
        amount: b.amount,
        includedInProjected: b.includedInProjected,
      })),
      yearlyOutflows: this._yearlyOutflows.map((o) => ({ amount: o.amount })),
      yearlyBudgets: this._yearlyBudgets.map((b) => ({ initialBalance: b.initialBalance })),
      includeYearlySectionInProjected: this._rappelAnnuelIncluded,
      pendingOutflows: this._pendingCharges.map((o) => ({ amount: o.amount })),
      includePendingOutflowsSectionInProjected: this._rappelChargesIncluded,
      pendingBudgets: this._pendingBudgets.map((b) => ({
        currentBalance: b.currentBalance,
        expenses: b.expenses.map((e) => ({ amount: e.amount })),
      })),
      includePendingBudgetsSectionInProjected: this._rappelBudgetsIncluded,
    });
  }

  private render(): void {
    const scrollBody = this.querySelector('.new-month-body');
    const savedScrollTop = (scrollBody as HTMLElement)?.scrollTop ?? 0;

    const openRappelDetails = new Set<'annuel' | 'charges' | 'budgets'>();
    for (const el of this.querySelectorAll('details.new-month-details[open]')) {
      const k = el.getAttribute('data-new-month-rappel-details');
      if (k === 'annuel' || k === 'charges' || k === 'budgets') openRappelDetails.add(k);
    }

    if (this._loading) {
      this.innerHTML = `
      <div class="new-month-panel" role="dialog" aria-modal="true" aria-label="Créer un nouveau mois">
        <header class="new-month-header">
          <h1 class="new-month-title">Créer un nouveau mois</h1>
        </header>
        <div class="new-month-body new-month-body--center">
          <p class="new-month-hint">Chargement…</p>
        </div>
      </div>`;
      return;
    }

    if (this._loadError) {
      this.innerHTML = `
      <div class="new-month-panel" role="dialog" aria-modal="true" aria-label="Créer un nouveau mois">
        <header class="new-month-header">
          <h1 class="new-month-title">Créer un nouveau mois</h1>
        </header>
        <div class="new-month-body new-month-body--center">
          <p class="new-month-hint">${escapeHtml(this._loadError)}</p>
          <button type="button" class="btn btn--primary" data-new-month-retry>Réessayer</button>
        </div>
      </div>`;
      return;
    }

    if (this._noDefaultTemplate) {
      this.innerHTML = `
      <div class="new-month-panel" role="dialog" aria-modal="true" aria-label="Créer un nouveau mois">
        <header class="new-month-header">
          <h1 class="new-month-title">Créer un nouveau mois</h1>
        </header>
        <div class="new-month-body new-month-body--center">
          <p class="new-month-hint">Vous n'avez pas encore créé de template par défaut 🙂</p>
          <p class="months-empty-placeholder__actions">
            <a href="/templates" class="months-empty-placeholder__cta" data-new-month-templates-link>Ajouter un template par défaut</a>
          </p>
        </div>
      </div>`;
      return;
    }

    const projected = this.getProjectedBalance();
    const monthValue = toMonthValue(this._month, this._year);

    const chargesList = [...this._charges]
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
      .map(
        (c) => `<li class="new-month-list__row">
        <buddj-line-item class="new-month-row new-month-row--charge ${c.includedInProjected ? '' : 'new-month-row--hidden'}" data-id="${escapeAttr(c.id)}" checkable-for="nm-ch-${escapeAttr(c.id)}" icon="${escapeAttr(c.icon)}" label="${escapeAttr(c.label)}" amount="${c.amount}" no-inner-padding>
          <input type="checkbox" slot="prefix" id="nm-ch-${escapeAttr(c.id)}" class="new-month-sr-checkbox" data-new-month-include="charge" data-template-row-id="${escapeAttr(c.id)}" ${c.includedInProjected ? 'checked' : ''} aria-label="Inclure dans le solde prévisionnel" />
          <div class="new-month-line-actions" slot="actions">
            <buddj-actions-dropdown position="right" target-id="${escapeAttr(c.id)}" data-dropdown-role="template-charge">
              <button type="button" class="btn btn-menu-dots" slot="trigger" title="Actions sur la charge" aria-label="Actions sur la charge">⋮</button>
              <button type="button" slot="items" data-action="edit">Modifier</button>
              <hr slot="items" class="dropdown-menu-separator" aria-hidden="true" />
              <button type="button" slot="items" data-action="delete" data-variant="danger">Supprimer</button>
            </buddj-actions-dropdown>
          </div>
        </buddj-line-item>
      </li>`
      )
      .join('');

    const budgetsList = [...this._budgets]
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
      .map(
        (b) => `<li class="new-month-list__row">
        <buddj-line-item class="new-month-row new-month-row--budget ${b.includedInProjected ? '' : 'new-month-row--hidden'}" data-id="${escapeAttr(b.id)}" checkable-for="nm-bu-${escapeAttr(b.id)}" icon="${escapeAttr(b.icon)}" label="${escapeAttr(b.label)}" amount="${b.amount}" no-inner-padding>
          <input type="checkbox" slot="prefix" id="nm-bu-${escapeAttr(b.id)}" class="new-month-sr-checkbox" data-new-month-include="budget" data-template-row-id="${escapeAttr(b.id)}" ${b.includedInProjected ? 'checked' : ''} aria-label="Inclure dans le solde prévisionnel" />
          <div class="new-month-line-actions" slot="actions">
            <buddj-actions-dropdown position="right" target-id="${escapeAttr(b.id)}" data-dropdown-role="template-budget">
              <button type="button" class="btn btn-menu-dots" slot="trigger" title="Actions sur le budget" aria-label="Actions sur le budget">⋮</button>
              <button type="button" slot="items" data-action="edit">Modifier</button>
              <hr slot="items" class="dropdown-menu-separator" aria-hidden="true" />
              <button type="button" slot="items" data-action="delete" data-variant="danger">Supprimer</button>
            </buddj-actions-dropdown>
          </div>
        </buddj-line-item>
      </li>`
      )
      .join('');

    const rappelLineItemRow = (kind: 'yearly-o' | 'yearly-b', row: YearlyOutRow | YearlyBudgetRow) => {
      const isO = kind === 'yearly-o';
      const label = isO ? (row as YearlyOutRow).label : (row as YearlyBudgetRow).name;
      const amount = isO ? (row as YearlyOutRow).amount : (row as YearlyBudgetRow).initialBalance;
      const icon = row.icon;
      const delTitle = isO ? 'Supprimer cette charge annuelle' : 'Supprimer ce budget annuel';
      return `<li class="new-month-list__row">
        <buddj-line-item class="new-month-row new-month-row--rappel new-month-row--yearly" data-yearly-id="${escapeAttr(row.id)}" data-yearly-kind="${isO ? 'o' : 'b'}" icon="${escapeAttr(icon)}" label="${escapeAttr(label)}" amount="${amount}" no-inner-padding>
          <div class="new-month-line-actions" slot="actions">
            <buddj-icon-delete title="${escapeAttr(delTitle)}" aria-label="${escapeAttr(delTitle)}" data-yearly-delete></buddj-icon-delete>
          </div>
        </buddj-line-item>
      </li>`;
    };

    const rappelAnnuelList = [
      ...this._yearlyOutflows.map((r) => rappelLineItemRow('yearly-o', r)),
      ...this._yearlyBudgets.map((r) => rappelLineItemRow('yearly-b', r)),
    ].join('');

    const totalAnnuel =
      this._yearlyOutflows.reduce((s, r) => s + r.amount, 0) +
      this._yearlyBudgets.reduce((s, r) => s + r.initialBalance, 0);

    const sortByLabel = (a: { label: string }, b: { label: string }) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
    const rappelChargesList = [...this._pendingCharges]
      .sort(sortByLabel)
      .map(
        (r) =>
          `<li class="new-month-list__row">
          <buddj-line-item class="new-month-row new-month-row--rappel" data-pending-outflow-id="${escapeAttr(r.id)}" icon="${escapeAttr(r.icon)}" label="${escapeAttr(r.label)}" amount="${r.amount}" no-inner-padding>
          <div class="new-month-line-actions" slot="actions">
            <buddj-icon-delete title="Supprimer" aria-label="Supprimer"></buddj-icon-delete>
          </div>
        </buddj-line-item>
        </li>`
      )
      .join('');

    const rappelBudgetsList = [...this._pendingBudgets]
      .sort(sortByLabel)
      .map((r) => {
        const pendingHtml =
          r.expenses.length > 0
            ? `<buddj-budget-pending count="${r.expenses.length}" class="new-month-row-pending"></buddj-budget-pending>`
            : '';
        const labelBlock = pendingHtml
          ? `<div class="new-month-row-label-wrap"><span class="new-month-row-label">${escapeHtml(r.label)}</span>${pendingHtml}</div>`
          : `<span class="new-month-row-label">${escapeHtml(r.label)}</span>`;
        return `<li class="new-month-list__row new-month-row new-month-row--rappel" data-pending-budget-id="${escapeAttr(r.id)}">
        <span class="new-month-row-icon" aria-hidden="true">${escapeHtml(r.icon)}</span>
        ${labelBlock}
        <span class="new-month-row-amount">${escapeHtml(formatAmount(r.currentBalance))}</span>
        <div class="new-month-line-actions">
          <buddj-icon-delete title="Supprimer" aria-label="Supprimer"></buddj-icon-delete>
        </div>
      </li>`;
      })
      .join('');

    const totalChargesPending = this._pendingCharges.reduce((s, r) => s + r.amount, 0);
    const totalBudgetsPending = this._pendingBudgets.reduce((s, r) => {
      const exp = r.expenses.reduce((a, e) => a + e.amount, 0);
      return s + r.currentBalance + exp;
    }, 0);

    const ctaDisabled = this._submitting ? ' disabled' : '';

    this.innerHTML = `
      <div class="new-month-panel" role="dialog" aria-modal="true" aria-label="Créer un nouveau mois">
        <header class="new-month-header">
          <h1 class="new-month-title">Créer un nouveau mois</h1>
        </header>
        <div class="new-month-projected-sticky" aria-live="polite">
          <span class="new-month-projected-label">Solde prévisionnel fin de mois</span>
          <span class="new-month-projected" data-new-month-projected>${escapeHtml(formatAmount(projected))}</span>
        </div>
        <div class="new-month-body">
          <section class="new-month-section">
            <h2 class="new-month-section-title">Mois et solde</h2>
            <div class="new-month-fields-row">
              <div class="new-month-field">
                <label class="new-month-label">Mois et année</label>
                <input type="month" class="new-month-date" data-new-month-date value="${escapeAttr(monthValue)}" aria-label="Mois et année" min="${CURRENT_YEAR - 2}-01" max="${CURRENT_YEAR + 2}-12">
              </div>
              <div class="new-month-field new-month-field--balance" data-new-month-balance-field>
                <label class="new-month-label">Solde initial</label>
                <button type="button" class="new-month-balance-btn" data-new-month-balance aria-label="Solde initial (ouvrir la calculatrice)">${escapeHtml(this._initialBalance || '0,00 €')}</button>
              </div>
            </div>
          </section>

          <section class="new-month-section" data-new-month-section="template-charges">
            <div class="new-month-section-head">
              <h2 class="new-month-section-title">Charges du template</h2>
              <div class="new-month-section-actions new-month-section-actions--charge">
                <buddj-icon-search title="Rechercher les charges du template" aria-label="Ouvrir la recherche"></buddj-icon-search>
                <buddj-btn-add label="Ajouter une charge" title="Ajouter une charge" data-new-month-add-charge></buddj-btn-add>
              </div>
            </div>
            <ul class="new-month-list">${chargesList || '<li class="new-month-list-empty">Aucune charge pour l\'instant</li>'}</ul>
          </section>

          <section class="new-month-section">
            <div class="new-month-section-head">
              <h2 class="new-month-section-title">Budgets du template</h2>
              <buddj-btn-add label="Ajouter un budget" title="Ajouter un budget" data-new-month-add-budget></buddj-btn-add>
            </div>
            <ul class="new-month-list">${budgetsList || '<li class="new-month-list-empty">Aucun budget pour l\'instant</li>'}</ul>
          </section>

          ${
            this._yearlyOutflows.length + this._yearlyBudgets.length > 0
              ? `
          <details class="new-month-section new-month-section--rappel new-month-section--rappel-annuel new-month-details" data-new-month-rappel-details="annuel">
            <summary class="new-month-details-summary">
              <span class="new-month-details-chevron" aria-hidden="true">▼</span>
              <div class="new-month-details-summary-body">
                <div class="new-month-section-head">
                  <h2 class="new-month-section-title">Charges et budgets annuels</h2>
                  <button type="button" class="btn new-month-btn-rappel-toggle ${this._rappelAnnuelIncluded ? 'new-month-btn-rappel-toggle--on' : ''}" data-rappel-section="annuel" title="${this._rappelAnnuelIncluded ? 'Exclure du solde' : 'Inclure'}">${this._rappelAnnuelIncluded ? 'Inclus' : 'Exclus'}</button>
                </div>
                <p class="new-month-rappel-total">Total : ${escapeHtml(formatAmount(totalAnnuel))}</p>
              </div>
            </summary>
            <div class="new-month-details-body">
              <p class="new-month-hint">Charges et budgets annuels pour ce mois calendaire.</p>
              <ul class="new-month-list new-month-list--rappel">${rappelAnnuelList}</ul>
            </div>
          </details>
          `
              : ''
          }

          ${
            this._pendingCharges.length > 0
              ? `
          <details class="new-month-section new-month-section--rappel new-month-section--rappel-charges new-month-details" data-new-month-rappel-details="charges">
            <summary class="new-month-details-summary">
              <span class="new-month-details-chevron" aria-hidden="true">▼</span>
              <div class="new-month-details-summary-body">
                <div class="new-month-section-head">
                  <h2 class="new-month-section-title">Charges des mois précédents</h2>
                  <button type="button" class="btn new-month-btn-rappel-toggle ${this._rappelChargesIncluded ? 'new-month-btn-rappel-toggle--on' : ''}" data-rappel-section="charges" title="${this._rappelChargesIncluded ? 'Exclure du solde' : 'Inclure'}">${this._rappelChargesIncluded ? 'Inclus' : 'Exclus'}</button>
                </div>
                <p class="new-month-rappel-total">Total : ${escapeHtml(formatAmount(totalChargesPending))}</p>
              </div>
            </summary>
            <div class="new-month-details-body">
              <p class="new-month-hint">Elles seront ajoutées à ce nouveau mois.</p>
              <ul class="new-month-list new-month-list--rappel">${rappelChargesList}</ul>
            </div>
          </details>
          `
              : ''
          }

          ${
            this._pendingBudgets.length > 0
              ? `
          <details class="new-month-section new-month-section--rappel new-month-section--rappel-budgets new-month-details" data-new-month-rappel-details="budgets">
            <summary class="new-month-details-summary">
              <span class="new-month-details-chevron" aria-hidden="true">▼</span>
              <div class="new-month-details-summary-body">
                <div class="new-month-section-head">
                  <h2 class="new-month-section-title">Budgets des mois précédents</h2>
                  <button type="button" class="btn new-month-btn-rappel-toggle ${this._rappelBudgetsIncluded ? 'new-month-btn-rappel-toggle--on' : ''}" data-rappel-section="budgets" title="${this._rappelBudgetsIncluded ? 'Exclure du solde' : 'Inclure'}">${this._rappelBudgetsIncluded ? 'Inclus' : 'Exclus'}</button>
                </div>
                <p class="new-month-rappel-total">Total : ${escapeHtml(formatAmount(totalBudgetsPending))}</p>
              </div>
            </summary>
            <div class="new-month-details-body">
              <p class="new-month-hint">Reste des budgets ou dépenses non prélevées.</p>
              <ul class="new-month-list new-month-list--rappel">${rappelBudgetsList}</ul>
            </div>
          </details>
          `
              : ''
          }

          <div class="new-month-actions">
            <button type="button" class="btn new-month-reset">Réinitialiser le formulaire</button>
            <button type="button" class="btn btn--primary new-month-cta"${ctaDisabled}>${this._submitting ? 'Création…' : 'Créer le mois'}</button>
          </div>
        </div>
      </div>
    `;
    const newBody = this.querySelector('.new-month-body');
    if (newBody && savedScrollTop > 0) (newBody as HTMLElement).scrollTop = savedScrollTop;

    for (const k of openRappelDetails) {
      this.querySelector(`details.new-month-details[data-new-month-rappel-details="${k}"]`)?.setAttribute('open', '');
    }
  }

  private attachListeners(): void {
    this.querySelector('[data-new-month-retry]')?.addEventListener('click', () => {
      this._loading = true;
      this.render();
      void this._loadScreenData();
    });

    this.querySelector('[data-new-month-templates-link]')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this._navigateToPath) this._navigateToPath('/templates');
    });

    const dateInput = this.querySelector('[data-new-month-date]') as HTMLInputElement;
    dateInput?.addEventListener('change', () => {
      const { month, year } = fromMonthValue(dateInput.value || toMonthValue(this._month, this._year));
      this._month = month;
      this._year = year;
      this._applyYearlySliceFromStore();
      this.render();
      this.attachListeners();
    });

    const balanceBtn = this.querySelector('[data-new-month-balance]');
    balanceBtn?.addEventListener('click', () => this.openBalanceDrawer());

    this.querySelector('[data-new-month-add-charge]')?.addEventListener('click', () => this.openAddCharge());
    this.querySelector('[data-new-month-add-budget]')?.addEventListener('click', () => this.openAddBudget());

    const panel = this.querySelector('.new-month-panel');
    panel?.addEventListener('buddj-dropdown-action', (e: Event) => {
      const ev = e as CustomEvent<{ actionId: string; targetId: string }>;
      const dd = e.composedPath().find(
        (n): n is HTMLElement => n instanceof HTMLElement && n.localName === 'buddj-actions-dropdown'
      );
      if (!dd || !ev.detail?.targetId) return;
      const role = dd.getAttribute('data-dropdown-role');
      const id = ev.detail.targetId;
      const action = ev.detail.actionId;
      if (role === 'template-charge') {
        if (action === 'edit') this.editCharge(id);
        if (action === 'delete') this.deleteCharge(id);
      } else if (role === 'template-budget') {
        if (action === 'edit') this.editBudget(id);
        if (action === 'delete') this.deleteBudget(id);
      }
    });

    panel?.addEventListener('change', (e: Event) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement) || t.type !== 'checkbox') return;
      const include = t.getAttribute('data-new-month-include');
      const rowId = t.getAttribute('data-template-row-id');
      if (!include || !rowId) return;
      if (include === 'charge') {
        const c = this._charges.find((x) => x.id === rowId);
        if (c) c.includedInProjected = t.checked;
        this.syncTemplateRowInclusionUi({ kind: 'charge', id: rowId });
      } else if (include === 'budget') {
        const b = this._budgets.find((x) => x.id === rowId);
        if (b) b.includedInProjected = t.checked;
        this.syncTemplateRowInclusionUi({ kind: 'budget', id: rowId });
      }
      this._updateProjectedOnly();
    });

    panel?.addEventListener('click', (e) => {
      const target = e.target as Element;
      const searchIcon = target.closest('buddj-icon-search');
      if (searchIcon?.closest('[data-new-month-section="template-charges"]')) {
        e.preventDefault();
        const drawer = document.getElementById('new-month-charge-search-drawer') as BuddjNewMonthChargeSearchDrawerElement;
        drawer?.open();
        return;
      }
      const deleteIcon = target.closest('buddj-icon-delete');
      if (deleteIcon?.closest('[data-yearly-delete]')) {
        const line = deleteIcon.closest('buddj-line-item[data-yearly-id]');
        const yid = line?.getAttribute('data-yearly-id');
        const yk = line?.getAttribute('data-yearly-kind');
        if (yid && (yk === 'o' || yk === 'b')) {
          e.preventDefault();
          this.deleteYearlyLine({ id: yid, kind: yk });
        }
        return;
      }
      if (deleteIcon) {
        const pendingLine = deleteIcon.closest('buddj-line-item[data-pending-outflow-id]');
        const pOid = pendingLine?.getAttribute('data-pending-outflow-id');
        if (pOid) {
          this.deletePendingCharge(pOid);
          return;
        }
        const pendingBudgetRow = deleteIcon.closest('[data-pending-budget-id]');
        const pBid = pendingBudgetRow?.getAttribute('data-pending-budget-id');
        if (pBid) {
          this.deletePendingBudget(pBid);
        }
      }
    });

    this.querySelectorAll('button[data-rappel-section]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const section = (e.currentTarget as HTMLElement).dataset.rappelSection!;
        this.toggleRappelSection(section);
      });
    });

    this.querySelector('.new-month-reset')?.addEventListener('click', () => this.resetForm());
    this.querySelector('.new-month-cta')?.addEventListener('click', () => this.submitForm());

    const store = this._monthStore;
    if (store) {
      store.removeEventListener('monthCreated', this._onMonthCreated);
      store.removeEventListener('createMonthFailed', this._onCreateFailed);
      store.addEventListener('monthCreated', this._onMonthCreated);
      store.addEventListener('createMonthFailed', this._onCreateFailed);
    }
  }

  private _updateProjectedOnly(): void {
    const el = this.querySelector('[data-new-month-projected]');
    if (el) el.textContent = formatAmount(this.getProjectedBalance());
  }

  private openBalanceDrawer(): void {
    const drawer = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
    drawer?.open({
      initialValue: this._initialBalance || '0,00 €',
      startWithInitialValue: false,
      onValidate: (value: string) => {
        this._initialBalance = value;
        this.updateBalanceDisplay();
        this._updateProjectedOnly();
      },
      onCancel: () => {},
    });
  }

  private updateBalanceDisplay(): void {
    const el = this.querySelector('[data-new-month-balance]');
    if (el) el.textContent = this._initialBalance || '0,00 €';
    this.querySelector('[data-new-month-balance-field]')?.classList.remove('new-month-field--error');
  }

  private openAddCharge(): void {
    const drawer = document.getElementById('charge-add-drawer') as HTMLElement & { open: (o?: object) => void };
    drawer?.open?.();
    const handler = (e: Event): void => {
      const ev = e as CustomEvent<{ label: string; amount: string; emoji: string }>;
      const { icon, text } = splitLeadingEmoji({
        label: ev.detail?.label ?? '',
        defaultIcon: ev.detail?.emoji ?? '💰',
      });
      this._charges.push({
        id: 'c' + Date.now(),
        icon,
        label: text,
        amount: parseEurosToNumber(ev.detail?.amount ?? '0'),
        includedInProjected: true,
      });
      document.removeEventListener('buddj-charge-add-done', handler);
      this.render();
      this.attachListeners();
      this._updateProjectedOnly();
    };
    document.addEventListener('buddj-charge-add-done', handler);
  }

  private openAddBudget(): void {
    const drawer = document.getElementById('budget-add-drawer') as BuddjBudgetAddDrawerElement | null;
    drawer?.open?.({
      onValidate: (label: string, amount: string, emoji: string) => {
        const { icon, text } = splitLeadingEmoji({ label, defaultIcon: emoji ?? '💰' });
        this._budgets.push({
          id: 'b' + Date.now(),
          icon,
          label: text,
          amount: parseEurosToNumber(amount),
          includedInProjected: true,
        });
        getToast()?.show({ message: 'Le budget a bien été ajouté' });
        this.render();
        this.attachListeners();
        this._updateProjectedOnly();
      },
    });
  }

  private deleteCharge(id: string): void {
    const c = this._charges.find((x) => x.id === id);
    if (!c) return;
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    const toast = getToast();
    modal?.show({
      title: `Voulez-vous vraiment supprimer la charge « ${c.label} » ?`,
      onConfirm: () => {
        this._charges = this._charges.filter((x) => x.id !== id);
        toast?.show({ message: 'La charge a bien été supprimée' });
        this.render();
        this.attachListeners();
        this._updateProjectedOnly();
      },
      onCancel: () => {},
    });
  }

  private syncTemplateRowInclusionUi({ kind, id }: { kind: 'charge' | 'budget'; id: string }): void {
    const model =
      kind === 'charge' ? this._charges.find((x) => x.id === id) : this._budgets.find((x) => x.id === id);
    if (!model) return;
    const row = this.querySelector(
      kind === 'charge'
        ? `buddj-line-item.new-month-row--charge[data-id="${CSS.escape(id)}"]`
        : `buddj-line-item.new-month-row--budget[data-id="${CSS.escape(id)}"]`
    );
    row?.classList.toggle('new-month-row--hidden', !model.includedInProjected);
    const cb = row?.querySelector<HTMLInputElement>(
      `input.new-month-sr-checkbox[data-template-row-id="${CSS.escape(id)}"]`
    );
    if (cb) cb.checked = model.includedInProjected;
  }

  private deleteYearlyLine({ id, kind }: { id: string; kind: 'o' | 'b' }): void {
    const isOutflow = kind === 'o';
    const label = isOutflow
      ? this._yearlyOutflows.find((x) => x.id === id)?.label
      : this._yearlyBudgets.find((x) => x.id === id)?.name;
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: isOutflow
        ? `Voulez-vous vraiment supprimer la charge annuelle « ${label ?? ''} » ?`
        : `Voulez-vous vraiment supprimer le budget annuel « ${label ?? ''} » ?`,
      onConfirm: () => {
        if (isOutflow) this._yearlyOutflows = this._yearlyOutflows.filter((x) => x.id !== id);
        else this._yearlyBudgets = this._yearlyBudgets.filter((x) => x.id !== id);
        getToast()?.show({
          message: isOutflow
            ? 'La charge annuelle a été retirée pour ce mois'
            : 'Le budget annuel a été retiré pour ce mois',
        });
        this.render();
        this.attachListeners();
        this._updateProjectedOnly();
      },
      onCancel: () => {},
    });
  }

  private editCharge(id: string): void {
    const c = this._charges.find((x) => x.id === id);
    if (!c) return;
    const drawer = document.getElementById('charge-add-drawer') as HTMLElement & {
      open: (o: {
        title?: string;
        initialLabel: string;
        initialAmount: string;
        initialEmoji: string;
        onValidate: BudgetChargeDrawerOnValidate;
      }) => void;
    };
    drawer?.open?.({
      title: 'Modifier la charge',
      initialLabel: c.label,
      initialAmount: formatAmount(c.amount),
      initialEmoji: c.icon,
      onValidate: (label: string, amount: string, emoji: string) => {
        const { icon, text } = splitLeadingEmoji({ label, defaultIcon: emoji });
        c.label = text;
        c.amount = parseEurosToNumber(amount);
        c.icon = emoji.trim() ? icon : c.icon;
        this.render();
        this.attachListeners();
        this._updateProjectedOnly();
      },
    });
  }

  private deleteBudget(id: string): void {
    const b = this._budgets.find((x) => x.id === id);
    if (!b) return;
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    const toast = getToast();
    modal?.show({
      title: `Voulez-vous vraiment supprimer le budget « ${b.label} » ?`,
      onConfirm: () => {
        this._budgets = this._budgets.filter((x) => x.id !== id);
        toast?.show({ message: 'Le budget a bien été supprimé' });
        this.render();
        this.attachListeners();
        this._updateProjectedOnly();
      },
      onCancel: () => {},
    });
  }

  private editBudget(id: string): void {
    const b = this._budgets.find((x) => x.id === id);
    if (!b) return;
    const drawer = document.getElementById('budget-add-drawer') as BuddjBudgetAddDrawerElement | null;
    drawer?.open?.({
      title: 'Modifier le budget',
      initialLabel: b.label,
      initialAmount: formatAmount(b.amount),
      initialEmoji: b.icon,
      onValidate: (label: string, amount: string, emoji: string) => {
        const { icon, text } = splitLeadingEmoji({ label, defaultIcon: emoji });
        b.label = text;
        b.amount = parseEurosToNumber(amount);
        b.icon = emoji.trim() ? icon : b.icon;
        getToast()?.show({ message: 'Le budget a bien été modifié' });
        this.render();
        this.attachListeners();
        this._updateProjectedOnly();
      },
    });
  }

  private deletePendingCharge(id: string): void {
    const c = this._pendingCharges.find((x) => x.id === id);
    if (!c) return;
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Voulez-vous vraiment supprimer la charge « ${c.label} » ?`,
      onConfirm: () => {
        this._pendingCharges = this._pendingCharges.filter((x) => x.id !== id);
        getToast()?.show({ message: 'La charge a bien été supprimée' });
        this.render();
        this.attachListeners();
        this._updateProjectedOnly();
      },
      onCancel: () => {},
    });
  }

  private deletePendingBudget(id: string): void {
    const b = this._pendingBudgets.find((x) => x.id === id);
    if (!b) return;
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Voulez-vous vraiment supprimer le budget « ${b.label} » ?`,
      onConfirm: () => {
        this._pendingBudgets = this._pendingBudgets.filter((x) => x.id !== id);
        getToast()?.show({ message: 'Le budget a bien été supprimé' });
        this.render();
        this.attachListeners();
        this._updateProjectedOnly();
      },
      onCancel: () => {},
    });
  }

  private toggleRappelSection(section: string): void {
    if (section === 'annuel') this._rappelAnnuelIncluded = !this._rappelAnnuelIncluded;
    else if (section === 'charges') this._rappelChargesIncluded = !this._rappelChargesIncluded;
    else if (section === 'budgets') this._rappelBudgetsIncluded = !this._rappelBudgetsIncluded;
    this.render();
    this.attachListeners();
    this._updateProjectedOnly();
  }

  private resetForm(): void {
    this._unsubYearly?.();
    this._unsubYearly = null;
    this._teardownMonthStoreListeners();
    this.open();
  }

  private submitForm(): void {
    const toast = getToast();
    const store = this._monthStore;
    if (!store) return;

    const balanceField = this.querySelector('[data-new-month-balance-field]');
    balanceField?.classList.remove('new-month-field--error');
    if (!this._initialBalance || this._initialBalance.trim() === '') {
      balanceField?.classList.add('new-month-field--error');
      toast?.show({ message: 'Le solde initial est requis', variant: 'warning' });
      return;
    }

    const startingBalance = parseEurosToNumber(this._initialBalance);
    const monthIso = firstDayIsoUtc({ month: this._month, year: this._year });

    const body = buildCreateMonthApiBody({
      monthFirstDayIso: monthIso,
      startingBalance,
      templateCharges: this._charges.map((c) => ({
        label: labelForApi(c.icon, c.label),
        amount: c.amount,
      })),
      templateBudgets: this._budgets.map((b) => ({
        name: labelForApi(b.icon, b.label),
        initialBalance: b.amount,
      })),
      yearlyOutflows: this._yearlyOutflows.map((o) => ({
        label: labelForApi(o.icon, o.label),
        amount: o.amount,
      })),
      yearlyBudgets: this._yearlyBudgets.map((b) => ({
        name: labelForApi(b.icon, b.name),
        initialBalance: b.initialBalance,
      })),
      pendingOutflows: this._pendingCharges.map((o) => ({
        label: labelForApi(o.icon, o.label),
        amount: o.amount,
        pendingFrom: o.pendingFrom,
      })),
      pendingBudgets: this._pendingBudgets.map((b) => ({
        name: labelForApi(b.icon, b.label),
        initialBalance: b.initialBalance,
        currentBalance: b.currentBalance,
        pendingFrom: b.pendingFrom,
        expenses: b.expenses,
      })),
    });

    this._submitting = true;
    this.render();
    this.attachListeners();
    store.emitAction('createMonth', { body });
  }
}

customElements.define(BuddjScreenNewMonth.tagName, BuddjScreenNewMonth);
