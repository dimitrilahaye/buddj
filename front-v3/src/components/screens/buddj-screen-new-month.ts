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

function formatMonthYear({ month, year }: { month: number; year: number }): string {
  const date = new Date(Date.UTC(year, month, 1));
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
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
  private _rappelYearlyChargesIncluded = true;
  private _rappelYearlyBudgetsIncluded = true;
  private _rappelChargesIncluded = true;
  private _rappelBudgetsIncluded = true;
  private _visibleStep = 1;
  private _activeStep = 1;

  private getProjectedBalanceToggleLabel({ included }: { included: boolean }): string {
    return included
      ? 'Exclure du calcul du solde prévisionnel'
      : 'Inclure dans le calcul du solde prévisionnel';
  }

  private getDeleteAllRappelLabel({ section }: { section: 'annuel-charges' | 'annuel-budgets' | 'charges' | 'budgets' }): string {
    if (section === 'annuel-charges') return 'Supprimer toutes les charges annuelles';
    if (section === 'annuel-budgets') return 'Supprimer tous les budgets annuels';
    if (section === 'charges') return 'Supprimer toutes les charges des mois précédents';
    return 'Supprimer tous les budgets des mois précédents';
  }

  /** Budgets reportés qu’on peut retirer de la création du mois (sans dépenses encore en attente sur le budget source). */
  private getDeletablePendingBudgets(): PendingBudgetRow[] {
    return this._pendingBudgets.filter((b) => b.expenses.length === 0);
  }
  private _pendingScrollStep: number | null = null;
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
    this._rappelYearlyChargesIncluded = true;
    this._rappelYearlyBudgetsIncluded = true;
    this._rappelChargesIncluded = true;
    this._rappelBudgetsIncluded = true;
    this._visibleStep = 1;
    this._activeStep = 1;
    this._pendingScrollStep = null;
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
      yearlyOutflows: this._rappelYearlyChargesIncluded ? this._yearlyOutflows.map((o) => ({ amount: o.amount })) : [],
      yearlyBudgets: this._rappelYearlyBudgetsIncluded
        ? this._yearlyBudgets.map((b) => ({ initialBalance: b.initialBalance }))
        : [],
      includeYearlySectionInProjected: true,
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
    const showStep = (step: number): string => (this._visibleStep >= step ? '' : ' hidden');
    const stepClass = (step: number): string => {
      const base = ['new-month-step'];
      if (this._visibleStep >= step) base.push('new-month-step--visible');
      if (this._activeStep === step) base.push('new-month-step--active');
      return base.join(' ');
    };

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

    const totalYearlyCharges = this._yearlyOutflows.reduce((s, r) => s + r.amount, 0);
    const totalYearlyBudgets = this._yearlyBudgets.reduce((s, r) => s + r.initialBalance, 0);

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
        const hasPendingExpenses = r.expenses.length > 0;
        const deleteTitle = hasPendingExpenses
          ? 'Impossible de supprimer : ce budget a encore des dépenses en attente'
          : 'Supprimer';
        const deleteIcon = hasPendingExpenses
          ? `<buddj-icon-delete disabled title="${escapeAttr(deleteTitle)}" aria-label="${escapeAttr(deleteTitle)}"></buddj-icon-delete>`
          : `<buddj-icon-delete title="Supprimer" aria-label="Supprimer"></buddj-icon-delete>`;
        return `<li class="new-month-list__row new-month-row new-month-row--rappel" data-pending-budget-id="${escapeAttr(r.id)}">
        <span class="new-month-row-icon" aria-hidden="true">${escapeHtml(r.icon)}</span>
        ${labelBlock}
        <span class="new-month-row-amount">${escapeHtml(formatAmount(r.currentBalance))}</span>
        <div class="new-month-line-actions">
          ${deleteIcon}
        </div>
      </li>`;
      })
      .join('');

    const totalChargesPending = this._pendingCharges.reduce((s, r) => s + r.amount, 0);
    const totalBudgetsPending = this._pendingBudgets.reduce((s, r) => {
      const exp = r.expenses.reduce((a, e) => a + e.amount, 0);
      return s + r.currentBalance + exp;
    }, 0);
    const deletablePendingBudgets = this.getDeletablePendingBudgets();
    const pendingBudgetsDeleteAllDisabled =
      this._pendingBudgets.length === 0 || deletablePendingBudgets.length === 0;
    const pendingBudgetsDeleteAllTitle =
      pendingBudgetsDeleteAllDisabled && this._pendingBudgets.some((b) => b.expenses.length > 0)
        ? 'Aucun budget supprimable : chaque budget a encore des dépenses en attente'
        : this.getDeleteAllRappelLabel({ section: 'budgets' });

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
          <nav class="new-month-stepper" aria-label="Étapes de création du mois">
            <button type="button" class="new-month-stepper-btn ${this._activeStep === 1 ? 'new-month-stepper-btn--active' : ''}" data-new-month-stepper-target="1" ${this._visibleStep >= 1 ? '' : 'disabled aria-disabled="true"'} aria-label="Étape 1">1</button>
            <button type="button" class="new-month-stepper-btn ${this._activeStep === 2 ? 'new-month-stepper-btn--active' : ''}" data-new-month-stepper-target="2" ${this._visibleStep >= 2 ? '' : 'disabled aria-disabled="true"'} aria-label="Étape 2">2</button>
            <button type="button" class="new-month-stepper-btn ${this._activeStep === 3 ? 'new-month-stepper-btn--active' : ''}" data-new-month-stepper-target="3" ${this._visibleStep >= 3 ? '' : 'disabled aria-disabled="true"'} aria-label="Étape 3">3</button>
            <button type="button" class="new-month-stepper-btn ${this._activeStep === 4 ? 'new-month-stepper-btn--active' : ''}" data-new-month-stepper-target="4" ${this._visibleStep >= 4 ? '' : 'disabled aria-disabled="true"'} aria-label="Étape 4">4</button>
          </nav>
          <section class="${stepClass(1)}" data-new-month-step="1">
            <h2 class="new-month-section-title" data-new-month-step-title="1">1. Mois et solde initial</h2>
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
            <div class="new-month-step-actions"${this._activeStep === 1 ? '' : ' hidden'}>
              <button type="button" class="btn btn--primary new-month-step-nav-btn new-month-step-nav-btn--next" data-new-month-step-next="2">Suivant</button>
            </div>
          </section>

          <section class="${stepClass(2)}"${showStep(2)} data-new-month-step="2">
            <h2 class="new-month-section-title" data-new-month-step-title="2">2. Charges et budgets template</h2>
            <section class="new-month-section" data-new-month-section="template-charges">
              <div class="new-month-section-head">
                <h3 class="new-month-section-title">Charges du template</h3>
                <div class="new-month-section-actions new-month-section-actions--charge">
                  <buddj-icon-search title="Rechercher les charges du template" aria-label="Ouvrir la recherche"></buddj-icon-search>
                  <buddj-btn-add label="Ajouter une charge" title="Ajouter une charge" data-new-month-add-charge></buddj-btn-add>
                </div>
              </div>
              <ul class="new-month-list">${chargesList || '<li class="new-month-list-empty">Aucune charge template pour l\'instant</li>'}</ul>
            </section>
            <section class="new-month-section">
              <div class="new-month-section-head">
                <h3 class="new-month-section-title">Budgets du template</h3>
                <buddj-btn-add label="Ajouter un budget" title="Ajouter un budget" data-new-month-add-budget></buddj-btn-add>
              </div>
              <ul class="new-month-list">${budgetsList || '<li class="new-month-list-empty">Aucun budget template pour l\'instant</li>'}</ul>
            </section>
            <div class="new-month-step-actions"${this._activeStep === 2 ? '' : ' hidden'}>
              <button type="button" class="btn new-month-step-nav-btn" data-new-month-step-prev="1">Précédent</button>
              <button type="button" class="btn btn--primary new-month-step-nav-btn new-month-step-nav-btn--next" data-new-month-step-next="3">Suivant</button>
            </div>
          </section>

          <section class="${stepClass(3)}"${showStep(3)} data-new-month-step="3">
            <h2 class="new-month-section-title" data-new-month-step-title="3">3. Charges et budgets annuels</h2>
            <section class="new-month-section new-month-section--rappel new-month-section--rappel-annuel">
              <div class="new-month-section-head new-month-section-head--rappel-title">
                <h3 class="new-month-section-title">Charges annuelles</h3>
              </div>
              <div class="new-month-rappel-controls">
                <p class="new-month-rappel-total">Total : ${escapeHtml(formatAmount(totalYearlyCharges))}</p>
                <button type="button" class="btn new-month-btn-rappel-toggle ${this._rappelYearlyChargesIncluded ? 'new-month-btn-rappel-toggle--on' : ''}" data-rappel-section="annuel-charges" title="${this.getProjectedBalanceToggleLabel({ included: this._rappelYearlyChargesIncluded })}">${this.getProjectedBalanceToggleLabel({ included: this._rappelYearlyChargesIncluded })}</button>
                <button type="button" class="btn new-month-btn-rappel-delete-all" data-rappel-delete-all="annuel-charges" title="${this.getDeleteAllRappelLabel({ section: 'annuel-charges' })}" aria-label="${this.getDeleteAllRappelLabel({ section: 'annuel-charges' })}" ${this._yearlyOutflows.length === 0 ? 'disabled' : ''}>Supprimer tout</button>
              </div>
              <ul class="new-month-list">${this._yearlyOutflows.map((r) => rappelLineItemRow('yearly-o', r)).join('') || '<li class="new-month-list-empty">Aucune charge annuelle trouvée pour ce mois</li>'}</ul>
            </section>
            <section class="new-month-section new-month-section--rappel new-month-section--rappel-annuel">
              <div class="new-month-section-head new-month-section-head--rappel-title">
                <h3 class="new-month-section-title">Budgets annuels</h3>
              </div>
              <div class="new-month-rappel-controls">
                <p class="new-month-rappel-total">Total : ${escapeHtml(formatAmount(totalYearlyBudgets))}</p>
                <button type="button" class="btn new-month-btn-rappel-toggle ${this._rappelYearlyBudgetsIncluded ? 'new-month-btn-rappel-toggle--on' : ''}" data-rappel-section="annuel-budgets" title="${this.getProjectedBalanceToggleLabel({ included: this._rappelYearlyBudgetsIncluded })}">${this.getProjectedBalanceToggleLabel({ included: this._rappelYearlyBudgetsIncluded })}</button>
                <button type="button" class="btn new-month-btn-rappel-delete-all" data-rappel-delete-all="annuel-budgets" title="${this.getDeleteAllRappelLabel({ section: 'annuel-budgets' })}" aria-label="${this.getDeleteAllRappelLabel({ section: 'annuel-budgets' })}" ${this._yearlyBudgets.length === 0 ? 'disabled' : ''}>Supprimer tout</button>
              </div>
              <ul class="new-month-list">${this._yearlyBudgets.map((r) => rappelLineItemRow('yearly-b', r)).join('') || '<li class="new-month-list-empty">Aucun budget annuel trouvé pour ce mois</li>'}</ul>
            </section>
            <div class="new-month-step-actions"${this._activeStep === 3 ? '' : ' hidden'}>
              <button type="button" class="btn new-month-step-nav-btn" data-new-month-step-prev="2">Précédent</button>
              <button type="button" class="btn btn--primary new-month-step-nav-btn new-month-step-nav-btn--next" data-new-month-step-next="4">Suivant</button>
            </div>
          </section>

          <section class="${stepClass(4)}"${showStep(4)} data-new-month-step="4">
            <h2 class="new-month-section-title" data-new-month-step-title="4">4. Charges et budgets des mois précédents</h2>
            <section class="new-month-section new-month-section--rappel new-month-section--rappel-charges">
              <div class="new-month-section-head new-month-section-head--rappel-title">
                <h3 class="new-month-section-title">Charges des mois précédents</h3>
              </div>
              <div class="new-month-rappel-controls">
                <p class="new-month-rappel-total">Total : ${escapeHtml(formatAmount(totalChargesPending))}</p>
                <button type="button" class="btn new-month-btn-rappel-toggle ${this._rappelChargesIncluded ? 'new-month-btn-rappel-toggle--on' : ''}" data-rappel-section="charges" title="${this.getProjectedBalanceToggleLabel({ included: this._rappelChargesIncluded })}">${this.getProjectedBalanceToggleLabel({ included: this._rappelChargesIncluded })}</button>
                <button type="button" class="btn new-month-btn-rappel-delete-all" data-rappel-delete-all="charges" title="${this.getDeleteAllRappelLabel({ section: 'charges' })}" aria-label="${this.getDeleteAllRappelLabel({ section: 'charges' })}" ${this._pendingCharges.length === 0 ? 'disabled' : ''}>Supprimer tout</button>
              </div>
              <ul class="new-month-list new-month-list--rappel">${rappelChargesList || '<li class="new-month-list-empty">Aucune charge reportée des mois précédents</li>'}</ul>
            </section>
            <section class="new-month-section new-month-section--rappel new-month-section--rappel-budgets">
              <div class="new-month-section-head new-month-section-head--rappel-title">
                <h3 class="new-month-section-title">Budgets des mois précédents</h3>
              </div>
              <div class="new-month-rappel-controls">
                <p class="new-month-rappel-total">Total : ${escapeHtml(formatAmount(totalBudgetsPending))}</p>
                <button type="button" class="btn new-month-btn-rappel-toggle ${this._rappelBudgetsIncluded ? 'new-month-btn-rappel-toggle--on' : ''}" data-rappel-section="budgets" title="${this.getProjectedBalanceToggleLabel({ included: this._rappelBudgetsIncluded })}">${this.getProjectedBalanceToggleLabel({ included: this._rappelBudgetsIncluded })}</button>
                <button type="button" class="btn new-month-btn-rappel-delete-all" data-rappel-delete-all="budgets" title="${escapeAttr(pendingBudgetsDeleteAllTitle)}" aria-label="${escapeAttr(pendingBudgetsDeleteAllTitle)}" ${pendingBudgetsDeleteAllDisabled ? 'disabled' : ''}>Supprimer tout</button>
              </div>
              <ul class="new-month-list new-month-list--rappel">${rappelBudgetsList || '<li class="new-month-list-empty">Aucun budget reporté des mois précédents</li>'}</ul>
            </section>
            <div class="new-month-step-actions"${this._activeStep === 4 ? '' : ' hidden'}>
              <button type="button" class="btn new-month-step-nav-btn" data-new-month-step-prev="3">Précédent</button>
            </div>
          </section>

          <div class="new-month-actions">
            <button type="button" class="btn new-month-reset">Réinitialiser le formulaire</button>
            <button type="button" class="btn btn--primary new-month-cta"${ctaDisabled}>${this._submitting ? 'Création…' : 'Créer le mois'}</button>
          </div>
        </div>
      </div>
    `;
    const newBody = this.querySelector('.new-month-body');
    if (newBody && savedScrollTop > 0) (newBody as HTMLElement).scrollTop = savedScrollTop;

    if (this._pendingScrollStep !== null) {
      const stepToScroll = this._pendingScrollStep;
      this._pendingScrollStep = null;
      requestAnimationFrame(() => {
        const title = this.querySelector(`[data-new-month-step-title="${stepToScroll}"]`);
        const body = this.querySelector('.new-month-body') as HTMLElement | null;
        const stepper = this.querySelector('.new-month-stepper') as HTMLElement | null;
        if (!title || !body) return;
        const bodyRect = body.getBoundingClientRect();
        const titleRect = (title as HTMLElement).getBoundingClientRect();
        const stepperHeight = stepper?.getBoundingClientRect().height ?? 0;
        const nextTop = body.scrollTop + (titleRect.top - bodyRect.top) - stepperHeight - 6;
        body.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
      });
    }
  }

  private _goToStep({ step, reveal }: { step: number; reveal: boolean }): void {
    const normalizedStep = Math.max(1, Math.min(4, step));
    this._activeStep = normalizedStep;
    if (reveal && normalizedStep > this._visibleStep) this._visibleStep = normalizedStep;
    this._pendingScrollStep = normalizedStep;
    this.render();
    this.attachListeners();
  }

  private _goToNextStep({ step }: { step: number }): void {
    if (step > 1 && !this._hasValidMonthAndBalance()) {
      const toast = getToast();
      const balanceField = this.querySelector('[data-new-month-balance-field]');
      balanceField?.classList.add('new-month-field--error');
      toast?.show({ message: 'Le mois et un solde initial supérieur à 0 € sont requis', variant: 'warning' });
      this._goToStep({ step: 1, reveal: true });
      return;
    }
    this._goToStep({ step, reveal: true });
  }

  private _goToStepFromStepper({ step }: { step: number }): void {
    if (step > this._visibleStep) return;
    this._goToStep({ step, reveal: false });
  }

  private _hasValidMonthAndBalance(): boolean {
    const monthValid = Number.isFinite(this._month) && this._month >= 0 && this._month <= 11;
    const balance = parseEurosToNumber(this._initialBalance);
    return monthValid && this._initialBalance.trim() !== '' && balance > 0;
  }

  private _validateBeforeSubmit(): boolean {
    const toast = getToast();
    const balanceField = this.querySelector('[data-new-month-balance-field]');
    balanceField?.classList.remove('new-month-field--error');
    if (!this._hasValidMonthAndBalance()) {
      balanceField?.classList.add('new-month-field--error');
      toast?.show({ message: 'Le mois et un solde initial supérieur à 0 € sont requis', variant: 'warning' });
      this._goToStep({ step: 1, reveal: true });
      return false;
    }
    return true;
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
      const deleteAllBtn = target.closest<HTMLButtonElement>('button[data-rappel-delete-all]');
      const deleteAllSection = deleteAllBtn?.dataset.rappelDeleteAll;
      if (
        deleteAllSection === 'annuel-charges' ||
        deleteAllSection === 'annuel-budgets' ||
        deleteAllSection === 'charges' ||
        deleteAllSection === 'budgets'
      ) {
        e.preventDefault();
        this.deleteAllRappelSection({ section: deleteAllSection });
        return;
      }
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
    this.querySelector('.new-month-cta')?.addEventListener('click', () => this.confirmSubmitForm());
    this.querySelectorAll<HTMLButtonElement>('[data-new-month-step-next]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = Number(btn.getAttribute('data-new-month-step-next') ?? '1');
        this._goToNextStep({ step });
      });
    });
    this.querySelectorAll<HTMLButtonElement>('[data-new-month-step-prev]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = Number(btn.getAttribute('data-new-month-step-prev') ?? '1');
        this._goToStep({ step, reveal: false });
      });
    });
    this.querySelectorAll<HTMLButtonElement>('[data-new-month-stepper-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = Number(btn.getAttribute('data-new-month-stepper-target') ?? '1');
        this._goToStepFromStepper({ step });
      });
    });

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
    if (b.expenses.length > 0) {
      getToast()?.show({
        message: 'Impossible de supprimer ce budget : il contient encore des dépenses en attente.',
        variant: 'error',
        durationMs: 3000,
      });
      return;
    }
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
    if (section === 'annuel-charges') this._rappelYearlyChargesIncluded = !this._rappelYearlyChargesIncluded;
    else if (section === 'annuel-budgets') this._rappelYearlyBudgetsIncluded = !this._rappelYearlyBudgetsIncluded;
    else if (section === 'charges') this._rappelChargesIncluded = !this._rappelChargesIncluded;
    else if (section === 'budgets') this._rappelBudgetsIncluded = !this._rappelBudgetsIncluded;
    this.render();
    this.attachListeners();
    this._updateProjectedOnly();
  }

  private deleteAllRappelSection({ section }: { section: 'annuel-charges' | 'annuel-budgets' | 'charges' | 'budgets' }): void {
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    const isYearlyCharges = section === 'annuel-charges';
    const isYearlyBudgets = section === 'annuel-budgets';
    const isPendingCharges = section === 'charges';
    const isPendingBudgets = section === 'budgets';
    const deletablePendingBudgets = isPendingBudgets ? this.getDeletablePendingBudgets() : [];
    const count = isYearlyCharges
      ? this._yearlyOutflows.length
      : isYearlyBudgets
        ? this._yearlyBudgets.length
        : isPendingCharges
          ? this._pendingCharges.length
          : deletablePendingBudgets.length;
    if (count === 0) {
      if (isPendingBudgets && this._pendingBudgets.length > 0) {
        getToast()?.show({
          message:
            'Aucun budget ne peut être supprimé : chaque budget a encore des dépenses en attente.',
          variant: 'error',
          durationMs: 3000,
        });
      }
      return;
    }
    const title = isYearlyCharges
      ? `Voulez-vous vraiment supprimer les ${count} charges annuelles de ce mois ?`
      : isYearlyBudgets
        ? `Voulez-vous vraiment supprimer les ${count} budgets annuels de ce mois ?`
        : isPendingCharges
          ? `Voulez-vous vraiment supprimer les ${count} charges des mois précédents ?`
          : `Voulez-vous vraiment supprimer les ${count} budget(s) des mois précédents sans dépenses en attente ?`;
    modal?.show({
      title,
      onConfirm: () => {
        if (isYearlyCharges) {
          this._yearlyOutflows = [];
          getToast()?.show({ message: 'Toutes les charges annuelles ont été retirées pour ce mois' });
        } else if (isYearlyBudgets) {
          this._yearlyBudgets = [];
          getToast()?.show({ message: 'Tous les budgets annuels ont été retirés pour ce mois' });
        } else if (isPendingCharges) {
          this._pendingCharges = [];
          getToast()?.show({ message: 'Toutes les charges des mois précédents ont été supprimées' });
        } else if (isPendingBudgets) {
          const kept = this._pendingBudgets.filter((b) => b.expenses.length > 0);
          const removed = this._pendingBudgets.length - kept.length;
          const blocked = kept.length;
          this._pendingBudgets = kept;
          if (blocked > 0 && removed > 0) {
            getToast()?.show({
              message: `${removed} budget(s) sans dépenses en attente supprimé(s). ${blocked} budget(s) avec dépenses en attente conservé(s).`, durationMs: 3000
            });
          } else {
            getToast()?.show({ message: 'Tous les budgets des mois précédents ont été supprimés' });
          }
        }
        this.render();
        this.attachListeners();
        this._updateProjectedOnly();
      },
      onCancel: () => {},
    });
  }

  private resetForm(): void {
    this._unsubYearly?.();
    this._unsubYearly = null;
    this._teardownMonthStoreListeners();
    this.open();
  }

  private confirmSubmitForm(): void {
    if (!this._validateBeforeSubmit()) return;
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    const monthLabel = formatMonthYear({ month: this._month, year: this._year });
    const projected = formatAmount(this.getProjectedBalance());
    modal?.show({
      title: `Confirmez-vous la création du mois de ${monthLabel} ?`,
      description: `Solde prévisionnel : ${projected}`,
      onConfirm: () => this.submitForm(),
      onCancel: () => {},
    });
  }

  private submitForm(): void {
    const store = this._monthStore;
    if (!store) return;

    if (!this._validateBeforeSubmit()) {
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
