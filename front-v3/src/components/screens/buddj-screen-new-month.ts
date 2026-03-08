/**
 * Écran « Créer un nouveau mois » : formulaire mois/année, solde initial, charges et budgets du template,
 * rappels (annuelles, mois précédents), solde prévisionnel, CTA.
 */
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import type { BudgetChargeDrawerOnValidate } from '../organisms/buddj-budget-add-drawer.js';
import type { BuddjNewMonthChargeSearchDrawerElement } from '../organisms/buddj-new-month-charge-search-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from '../organisms/buddj-calculator-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

const CURRENT_YEAR = new Date().getFullYear();

/** Valeur pour input type="month" : YYYY-MM */
function toMonthValue(month: number, year: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function fromMonthValue(value: string): { month: number; year: number } {
  const [y, m] = value.split('-').map(Number);
  return { month: (m ?? 1) - 1, year: y ?? CURRENT_YEAR };
}

interface TemplateCharge {
  id: string;
  icon: string;
  label: string;
  amount: number;
  hidden: boolean;
}

interface TemplateBudget {
  id: string;
  icon: string;
  label: string;
  amount: number;
  hidden: boolean;
}

interface RappelItem {
  id: string;
  icon?: string;
  label: string;
  amount: number;
  included: boolean;
  /** Nombre de dépenses en attente (budgets des mois précédents uniquement) */
  pendingExpensesCount?: number;
}

function parseAmount(s: string): number {
  const cleaned = (s || '').replace(/\s/g, '').replace('€', '').replace(/restant.*/gi, '').trim().replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

function formatAmount(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

const TEMPLATE_CHARGES: TemplateCharge[] = [
  { id: 'c1', icon: '🏠', label: 'Loyer', amount: 650, hidden: false },
  { id: 'c2', icon: '⚡', label: 'Électricité', amount: 82, hidden: false },
  { id: 'c3', icon: '🛡️', label: 'Assurance auto', amount: 45, hidden: false },
  { id: 'c4', icon: '📶', label: 'Internet', amount: 29.99, hidden: false },
  { id: 'c5', icon: '💪', label: 'Abonnement sport', amount: 39, hidden: false },
];

const TEMPLATE_BUDGETS: TemplateBudget[] = [
  { id: 'b1', icon: '🏖️', label: 'Vacances', amount: 200, hidden: false },
  { id: 'b2', icon: '🎬', label: 'Sorties', amount: 100, hidden: false },
];

const RAPPEL_ANNUEL: RappelItem[] = [
  { id: 'ra1', icon: '🛡️', label: 'Assurance habitation (prorata)', amount: 120, included: true },
];

const RAPPEL_CHARGES_PRECEDENTES: RappelItem[] = [
  { id: 'rc1', icon: '🏠', label: 'Loyer mars non prélevé', amount: 650, included: true },
];

const RAPPEL_BUDGETS_PRECEDENTES: RappelItem[] = [
  { id: 'rb1', icon: '🏖️', label: 'Vacances mars', amount: 50, included: true, pendingExpensesCount: 2 },
  { id: 'rb2', icon: '🎬', label: 'Sorties mars', amount: 12, included: true, pendingExpensesCount: 0 },
];

export class BuddjScreenNewMonth extends HTMLElement {
  static readonly tagName = 'buddj-screen-new-month';

  private _month = new Date().getMonth();
  private _year = CURRENT_YEAR;
  private _initialBalance = '';
  private _charges: TemplateCharge[] = [];
  private _budgets: TemplateBudget[] = [];
  private _rappelAnnuel: RappelItem[] = [];
  private _rappelCharges: RappelItem[] = [];
  private _rappelBudgets: RappelItem[] = [];
  private _rappelAnnuelIncluded = true;
  private _rappelChargesIncluded = true;
  private _rappelBudgetsIncluded = true;

  connectedCallback(): void {
    this.open();
  }

  open(): void {
    this._month = new Date().getMonth();
    this._year = CURRENT_YEAR;
    this._initialBalance = '';
    this._charges = TEMPLATE_CHARGES.map((c) => ({ ...c }));
    this._budgets = TEMPLATE_BUDGETS.map((b) => ({ ...b }));
    this._rappelAnnuel = RAPPEL_ANNUEL.map((r) => ({ ...r }));
    this._rappelCharges = RAPPEL_CHARGES_PRECEDENTES.map((r) => ({ ...r }));
    this._rappelBudgets = RAPPEL_BUDGETS_PRECEDENTES.map((r) => ({ ...r }));
    this._rappelAnnuelIncluded = true;
    this._rappelChargesIncluded = true;
    this._rappelBudgetsIncluded = true;
    this.render();
    this.classList.add('new-month-screen--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('new-month-screen--open');
  }

  private getProjectedBalance(): number {
    const initial = parseAmount(this._initialBalance);
    const chargesSum = this._charges.filter((c) => !c.hidden).reduce((s, c) => s + c.amount, 0);
    const budgetsSum = this._budgets.filter((b) => !b.hidden).reduce((s, b) => s + b.amount, 0);
    const rappelAnnuelSum = this._rappelAnnuelIncluded ? this._rappelAnnuel.reduce((s, r) => s + r.amount, 0) : 0;
    const rappelChargesSum = this._rappelChargesIncluded ? this._rappelCharges.reduce((s, r) => s + r.amount, 0) : 0;
    const rappelBudgetsSum = this._rappelBudgetsIncluded ? this._rappelBudgets.reduce((s, r) => s + r.amount, 0) : 0;
    return initial - chargesSum - budgetsSum - rappelAnnuelSum - rappelChargesSum - rappelBudgetsSum;
  }

  private render(): void {
    const scrollBody = this.querySelector('.new-month-body');
    const savedScrollTop = (scrollBody as HTMLElement)?.scrollTop ?? 0;

    const projected = this.getProjectedBalance();
    const monthValue = toMonthValue(this._month, this._year);

    const chargesList = [...this._charges]
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
      .map(
        (c) => `
        <buddj-line-item class="new-month-row new-month-row--charge ${c.hidden ? 'new-month-row--hidden' : ''}" data-id="${escapeAttr(c.id)}" icon="${escapeAttr(c.icon)}" label="${escapeAttr(c.label)}" amount="${c.amount}" no-inner-padding>
          <div class="new-month-row-actions budget-card-actions" slot="actions">
            <buddj-icon-edit title="Modifier la charge"></buddj-icon-edit>
            <buddj-icon-delete title="Supprimer la charge"></buddj-icon-delete>
            <button type="button" class="btn new-month-btn-include-toggle ${c.hidden ? '' : 'new-month-btn-rappel-toggle--on'}" data-toggle-charge="${escapeAttr(c.id)}" title="${c.hidden ? 'Inclure' : 'Exclure du solde prévisionnel'}">${c.hidden ? 'Exclus' : 'Inclus'}</button>
          </div>
        </buddj-line-item>`
      )
      .join('');

    const budgetsList = [...this._budgets]
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
      .map(
        (b) => `
        <buddj-line-item class="new-month-row new-month-row--budget ${b.hidden ? 'new-month-row--hidden' : ''}" data-id="${escapeAttr(b.id)}" icon="${escapeAttr(b.icon)}" label="${escapeAttr(b.label)}" amount="${b.amount}" no-inner-padding>
          <div class="new-month-row-actions budget-card-actions" slot="actions">
            <buddj-icon-edit title="Modifier le budget"></buddj-icon-edit>
            <buddj-icon-delete title="Supprimer le budget"></buddj-icon-delete>
            <button type="button" class="btn new-month-btn-include-toggle ${b.hidden ? '' : 'new-month-btn-rappel-toggle--on'}" data-toggle-budget="${escapeAttr(b.id)}" title="${b.hidden ? 'Inclure' : 'Exclure du solde prévisionnel'}">${b.hidden ? 'Exclus' : 'Inclus'}</button>
          </div>
        </buddj-line-item>`
      )
      .join('');

    const rappelLineItemRow = (r: RappelItem, section: string) =>
      `<buddj-line-item class="new-month-row new-month-row--rappel" data-id="${escapeAttr(r.id)}" data-rappel-section="${escapeAttr(section)}" icon="${escapeAttr(r.icon ?? '')}" label="${escapeAttr(r.label)}" amount="${r.amount}" no-inner-padding>
          <div class="new-month-row-actions budget-card-actions" slot="actions">
            <buddj-icon-delete title="Supprimer"></buddj-icon-delete>
          </div>
        </buddj-line-item>`;

    const rappelItemRowBudgets = (r: RappelItem) => {
      const iconHtml = r.icon ? `<span class="new-month-row-icon" aria-hidden="true">${escapeHtml(r.icon)}</span>` : '';
      const pendingHtml =
        r.pendingExpensesCount != null
          ? `<buddj-budget-pending count="${r.pendingExpensesCount}" class="new-month-row-pending"></buddj-budget-pending>`
          : '';
      const labelBlock = pendingHtml
        ? `<div class="new-month-row-label-wrap"><span class="new-month-row-label">${escapeHtml(r.label)}</span>${pendingHtml}</div>`
        : `<span class="new-month-row-label">${escapeHtml(r.label)}</span>`;
      return `<li class="new-month-row new-month-row--rappel" data-id="${escapeAttr(r.id)}" data-rappel-section="budgets">
        ${iconHtml}
        ${labelBlock}
        <span class="new-month-row-amount">${escapeHtml(formatAmount(r.amount))}</span>
        <div class="new-month-row-actions budget-card-actions">
          <buddj-icon-delete title="Supprimer"></buddj-icon-delete>
        </div>
      </li>`;
    };

    const sortByLabel = (a: { label: string }, b: { label: string }) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
    const rappelAnnuelList = [...this._rappelAnnuel].sort(sortByLabel).map((r) => rappelLineItemRow(r, 'annuel')).join('');
    const rappelChargesList = [...this._rappelCharges].sort(sortByLabel).map((r) => rappelLineItemRow(r, 'charges')).join('');
    const rappelBudgetsList = [...this._rappelBudgets].sort(sortByLabel).map((r) => rappelItemRowBudgets(r)).join('');

    const totalAnnuel = this._rappelAnnuel.reduce((s, r) => s + r.amount, 0);
    const totalCharges = this._rappelCharges.reduce((s, r) => s + r.amount, 0);
    const totalBudgets = this._rappelBudgets.reduce((s, r) => s + r.amount, 0);

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

          ${this._rappelAnnuel.length > 0 ? `
          <section class="new-month-section new-month-section--rappel new-month-section--rappel-annuel">
            <div class="new-month-section-head">
              <h2 class="new-month-section-title">Charges annuelles ce mois</h2>
              <button type="button" class="btn new-month-btn-rappel-toggle ${this._rappelAnnuelIncluded ? 'new-month-btn-rappel-toggle--on' : ''}" data-rappel-section="annuel" title="${this._rappelAnnuelIncluded ? 'Exclure du solde' : 'Inclure'}">${this._rappelAnnuelIncluded ? 'Inclus' : 'Exclus'}</button>
            </div>
            <p class="new-month-rappel-total">Total : ${escapeHtml(formatAmount(totalAnnuel))}</p>
            <p class="new-month-hint">Charges annuelles comptabilisées dans ce nouveau mois.</p>
            <ul class="new-month-list new-month-list--rappel">${rappelAnnuelList}</ul>
          </section>
          ` : ''}

          ${this._rappelCharges.length > 0 ? `
          <section class="new-month-section new-month-section--rappel new-month-section--rappel-charges">
            <div class="new-month-section-head">
              <h2 class="new-month-section-title">Charges des mois précédents</h2>
              <button type="button" class="btn new-month-btn-rappel-toggle ${this._rappelChargesIncluded ? 'new-month-btn-rappel-toggle--on' : ''}" data-rappel-section="charges" title="${this._rappelChargesIncluded ? 'Exclure du solde' : 'Inclure'}">${this._rappelChargesIncluded ? 'Inclus' : 'Exclus'}</button>
            </div>
            <p class="new-month-rappel-total">Total : ${escapeHtml(formatAmount(totalCharges))}</p>
            <p class="new-month-hint">Elles seront ajoutées à ce nouveau mois.</p>
            <ul class="new-month-list new-month-list--rappel">${rappelChargesList}</ul>
          </section>
          ` : ''}

          ${this._rappelBudgets.length > 0 ? `
          <section class="new-month-section new-month-section--rappel new-month-section--rappel-budgets">
            <div class="new-month-section-head">
              <h2 class="new-month-section-title">Budgets des mois précédents</h2>
              <button type="button" class="btn new-month-btn-rappel-toggle ${this._rappelBudgetsIncluded ? 'new-month-btn-rappel-toggle--on' : ''}" data-rappel-section="budgets" title="${this._rappelBudgetsIncluded ? 'Exclure du solde' : 'Inclure'}">${this._rappelBudgetsIncluded ? 'Inclus' : 'Exclus'}</button>
            </div>
            <p class="new-month-rappel-total">Total : ${escapeHtml(formatAmount(totalBudgets))}</p>
            <p class="new-month-hint">Reste des budgets ou dépenses non prélevées.</p>
            <ul class="new-month-list new-month-list--rappel">${rappelBudgetsList}</ul>
          </section>
          ` : ''}

          <div class="new-month-actions">
            <button type="button" class="btn new-month-reset">Réinitialiser le formulaire</button>
            <button type="button" class="btn btn--primary new-month-cta">Créer le mois</button>
          </div>
        </div>
      </div>
    `;
    const newBody = this.querySelector('.new-month-body');
    if (newBody && savedScrollTop > 0) (newBody as HTMLElement).scrollTop = savedScrollTop;
  }

  private attachListeners(): void {
    const dateInput = this.querySelector('[data-new-month-date]') as HTMLInputElement;
    dateInput?.addEventListener('change', () => {
      const { month, year } = fromMonthValue(dateInput.value || toMonthValue(this._month, this._year));
      this._month = month;
      this._year = year;
      this.updateProjected();
    });

    const balanceBtn = this.querySelector('[data-new-month-balance]');
    balanceBtn?.addEventListener('click', () => this.openBalanceDrawer());

    this.querySelector('[data-new-month-add-charge]')?.addEventListener('click', () => this.openAddCharge());
    this.querySelector('[data-new-month-add-budget]')?.addEventListener('click', () => this.openAddBudget());

    const panel = this.querySelector('.new-month-panel');
    panel?.addEventListener('click', (e) => {
      const target = e.target as Element;
      const searchIcon = target.closest('buddj-icon-search');
      if (searchIcon?.closest('[data-new-month-section="template-charges"]')) {
        e.preventDefault();
        const drawer = document.getElementById('new-month-charge-search-drawer') as BuddjNewMonthChargeSearchDrawerElement;
        drawer?.open();
        return;
      }
      const editIcon = target.closest('buddj-icon-edit');
      const deleteIcon = target.closest('buddj-icon-delete');
      const row = (editIcon ?? deleteIcon)?.closest('.new-month-row');
      const id = row?.getAttribute('data-id');
      if (!id) return;
      if (editIcon) {
        e.stopPropagation();
        if (row?.classList.contains('new-month-row--charge')) this.editCharge(id);
        else if (row?.classList.contains('new-month-row--budget')) this.editBudget(id);
        return;
      }
      if (deleteIcon) {
        if (row?.classList.contains('new-month-row--charge')) this.deleteCharge(id);
        else if (row?.classList.contains('new-month-row--budget')) this.deleteBudget(id);
        else if (row?.classList.contains('new-month-row--rappel')) {
          const section = row.getAttribute('data-rappel-section');
          if (section) this.deleteRappelItem(section, id);
        }
      }
    });

    this.querySelectorAll('[data-toggle-charge]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = (e.currentTarget as HTMLElement).dataset.toggleCharge;
        this.toggleCharge(id!);
      });
    });
    this.querySelectorAll('[data-toggle-budget]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = (e.currentTarget as HTMLElement).dataset.toggleBudget;
        this.toggleBudget(id!);
      });
    });

    this.querySelectorAll('button[data-rappel-section]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const section = (e.currentTarget as HTMLElement).dataset.rappelSection!;
        this.toggleRappelSection(section);
      });
    });

    this.querySelector('.new-month-reset')?.addEventListener('click', () => this.resetForm());
    this.querySelector('.new-month-cta')?.addEventListener('click', () => this.submitForm());
  }

  private updateProjected(): void {
    const el = this.querySelector('[data-new-month-projected]');
    if (el) el.textContent = formatAmount(this.getProjectedBalance());
  }

  private openBalanceDrawer(): void {
    const drawer = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
    drawer?.open({
      initialValue: this._initialBalance || '0,00 €',
      startWithInitialValue: !!this._initialBalance,
      onValidate: (value: string) => {
        this._initialBalance = value;
        this.updateBalanceDisplay();
        this.updateProjected();
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
      this._charges.push({
        id: 'c' + Date.now(),
        icon: ev.detail?.emoji ?? '🏠',
        label: ev.detail?.label ?? '',
        amount: parseAmount(ev.detail?.amount ?? '0'),
        hidden: false,
      });
      document.removeEventListener('buddj-charge-add-done', handler);
      this.render();
      this.attachListeners();
      this.updateProjected();
    };
    document.addEventListener('buddj-charge-add-done', handler);
  }

  private openAddBudget(): void {
    const drawer = document.getElementById('budget-add-drawer') as HTMLElement & { open: (o?: object) => void };
    drawer?.open?.();
    const handler = (e: Event): void => {
      const ev = e as CustomEvent<{ label: string; amount: string; emoji: string }>;
      this._budgets.push({
        id: 'b' + Date.now(),
        icon: ev.detail?.emoji ?? '💰',
        label: ev.detail?.label ?? '',
        amount: parseAmount(ev.detail?.amount ?? '0'),
        hidden: false,
      });
      document.removeEventListener('buddj-budget-add-done', handler);
      this.render();
      this.attachListeners();
      this.updateProjected();
    };
    document.addEventListener('buddj-budget-add-done', handler);
  }

  private deleteCharge(id: string): void {
    const c = this._charges.find((x) => x.id === id);
    if (!c) return;
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    const toast = getToast();
    modal?.show({
      title: `Voulez-vous vraiment supprimer la charge « ${c.label} » ?`,
      onConfirm: () => {
        toast?.show({ message: 'La charge a bien été supprimée' });
      },
      onCancel: () => {},
    });
  }

  private toggleCharge(id: string): void {
    const c = this._charges.find((x) => x.id === id);
    if (c) c.hidden = !c.hidden;
    this.render();
    this.attachListeners();
    this.updateProjected();
  }

  private editCharge(id: string): void {
    const c = this._charges.find((x) => x.id === id);
    if (!c) return;
    const drawer = document.getElementById('charge-add-drawer') as HTMLElement & {
      open: (o: { title?: string; initialLabel: string; initialAmount: string; initialEmoji: string; onValidate: BudgetChargeDrawerOnValidate }) => void;
    };
    drawer?.open?.({
      title: 'Modifier la charge',
      initialLabel: c.label,
      initialAmount: formatAmount(c.amount),
      initialEmoji: c.icon,
      onValidate: (label: string, amount: string, emoji: string) => {
        c.label = label;
        c.amount = parseAmount(amount);
        c.icon = emoji;
        this.render();
        this.attachListeners();
        this.updateProjected();
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
        toast?.show({ message: 'Le budget a bien été supprimé' });
      },
      onCancel: () => {},
    });
  }

  private toggleBudget(id: string): void {
    const b = this._budgets.find((x) => x.id === id);
    if (b) b.hidden = !b.hidden;
    this.render();
    this.attachListeners();
    this.updateProjected();
  }

  private editBudget(id: string): void {
    const b = this._budgets.find((x) => x.id === id);
    if (!b) return;
    const drawer = document.getElementById('budget-add-drawer') as HTMLElement & {
      open: (o: { title?: string; initialLabel: string; initialAmount: string; initialEmoji: string; onValidate: BudgetChargeDrawerOnValidate }) => void;
    };
    drawer?.open?.({
      title: 'Modifier le budget',
      initialLabel: b.label,
      initialAmount: formatAmount(b.amount),
      initialEmoji: b.icon,
      onValidate: (label: string, amount: string, emoji: string) => {
        b.label = label;
        b.amount = parseAmount(amount);
        b.icon = emoji;
        this.render();
        this.attachListeners();
        this.updateProjected();
      },
    });
  }

  private toggleRappelSection(section: string): void {
    if (section === 'annuel') this._rappelAnnuelIncluded = !this._rappelAnnuelIncluded;
    else if (section === 'charges') this._rappelChargesIncluded = !this._rappelChargesIncluded;
    else if (section === 'budgets') this._rappelBudgetsIncluded = !this._rappelBudgetsIncluded;
    this.render();
    this.attachListeners();
    this.updateProjected();
  }

  private deleteRappelItem(section: string, id: string): void {
    const list = section === 'annuel' ? this._rappelAnnuel : section === 'charges' ? this._rappelCharges : this._rappelBudgets;
    const item = list.find((x) => x.id === id);
    if (!item) return;
    const typeLabel =
      section === 'annuel' ? 'la charge annuelle' : section === 'charges' ? 'la charge des mois précédents' : 'le budget des mois précédents';
    const toastMsg =
      section === 'annuel' ? 'La charge annuelle a bien été supprimée' : section === 'charges' ? 'La charge des mois précédents a bien été supprimée' : 'Le budget des mois précédents a bien été supprimé';
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    const toast = getToast();
    modal?.show({
      title: `Voulez-vous vraiment supprimer ${typeLabel} « ${item.label} » ?`,
      onConfirm: () => {
        toast?.show({ message: toastMsg });
      },
      onCancel: () => {},
    });
  }

  private resetForm(): void {
    this.open();
  }

  private submitForm(): void {
    const toast = getToast();
    const balanceField = this.querySelector('[data-new-month-balance-field]');
    balanceField?.classList.remove('new-month-field--error');
    if (!this._initialBalance || this._initialBalance.trim() === '') {
      balanceField?.classList.add('new-month-field--error');
      toast?.show({ message: 'Le solde initial est requis', variant: 'warning' });
      return;
    }
    toast?.show({ message: 'Le mois a bien été créé' });
    this.dispatchEvent(new CustomEvent('buddj-new-month-close', { bubbles: true }));
  }
}

customElements.define(BuddjScreenNewMonth.tagName, BuddjScreenNewMonth);
