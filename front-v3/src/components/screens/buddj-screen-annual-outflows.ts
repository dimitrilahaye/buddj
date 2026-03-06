/**
 * Écran Sorties annuelles : pour chaque mois de l’année, charges et budgets configurés.
 * Header + sticky « Total par mois » (somme / 12) + liste scrollable des 12 mois.
 * Inspiré de l’UX du détail template (recap, charge-group, budget-group).
 */
import type { ChargeItemData } from './buddj-screen-recurring.js';
import { formatEuros } from '../../shared/goal.js';
import { escapeHtml } from '../../shared/escape.js';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

type BudgetItem = { name: string; icon: string; allocated: number };

interface MonthData {
  charges: ChargeItemData[];
  budgets: BudgetItem[];
}

const MOCK_ANNUAL: MonthData[] = [
  { charges: [{ icon: '🐕', label: 'Croquettes chat', amount: 45 }, { icon: '🛡️', label: 'Assurance annuelle', amount: 40 }], budgets: [{ name: 'Vacances', icon: '🏖️', allocated: 120 }] },
  { charges: [], budgets: [] },
  { charges: [], budgets: [] },
  { charges: [], budgets: [{ name: 'Vacances', icon: '🏖️', allocated: 350 }] },
  { charges: [], budgets: [] },
  { charges: [], budgets: [] },
  { charges: [], budgets: [] },
  { charges: [], budgets: [{ name: 'Vacances', icon: '🏖️', allocated: 350 }] },
  { charges: [], budgets: [] },
  { charges: [], budgets: [] },
  { charges: [], budgets: [] },
  { charges: [], budgets: [{ name: 'Noël', icon: '🎄', allocated: 250 }] },
];

export class BuddjScreenAnnualOutflows extends HTMLElement {
  static readonly tagName = 'buddj-screen-annual-outflows';

  private _months: MonthData[] = MOCK_ANNUAL.map((m) => ({
    charges: m.charges.map((c) => ({ ...c })),
    budgets: m.budgets.map((b) => ({ ...b })),
  }));

  connectedCallback(): void {
    if (this.querySelector('#annual-outflows')) return;
    this.render();
    this.attachListeners();
  }

  private getTotalAnnual(): number {
    let sum = 0;
    for (const m of this._months) {
      sum += m.charges.reduce((s, c) => s + c.amount, 0);
      sum += m.budgets.reduce((s, b) => s + b.allocated, 0);
    }
    return sum;
  }

  private getTotalPerMonth(): number {
    return Math.round((this.getTotalAnnual() / 12) * 100) / 100;
  }

  private render(): void {
    const totalPerMonth = this.getTotalPerMonth();
    const main = document.createElement('main');
    main.id = 'annual-outflows';
    main.className = 'screen screen--annual-outflows';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap annual-outflows-sticky-wrap">
        <header class="new-month-header annual-outflows-header">
          <div class="annual-outflows-header-row">
            <h1 class="new-month-title">Sorties annuelles</h1>
            <div class="annual-outflows-header-actions">
              <buddj-icon-search class="annual-outflows-search" title="Rechercher" aria-label="Rechercher dans les sorties annuelles"></buddj-icon-search>
              <buddj-toggle-all target-selector="details.annual-outflows-month" title-expand="Déplier tous les mois" title-collapse="Replier tous les mois"></buddj-toggle-all>
            </div>
          </div>
        </header>
        <div class="new-month-projected-sticky" aria-live="polite">
          <span class="new-month-projected-label">Total par mois</span>
          <span class="new-month-projected" data-annual-total-per-month>${escapeHtml(formatEuros(totalPerMonth))}</span>
        </div>
      </div>
      <section class="annual-outflows-sections" aria-label="Mois de l’année"></section>
    `;

    const sectionsEl = main.querySelector('.annual-outflows-sections')!;
    for (let i = 0; i < 12; i++) {
      const monthName = MONTH_NAMES[i];
      const data = this._months[i]!;
      const chargesTotal = data.charges.reduce((s, c) => s + c.amount, 0);
      const budgetsTotal = data.budgets.reduce((s, b) => s + b.allocated, 0);
      const chargesRecap = `${data.charges.length} charge${data.charges.length !== 1 ? 's' : ''} — ${formatEuros(chargesTotal)}`;
      const budgetsRecap = `${data.budgets.length} budget${data.budgets.length !== 1 ? 's' : ''} — ${formatEuros(budgetsTotal)}`;

      const details = document.createElement('details');
      details.className = 'annual-outflows-month';
      details.dataset.monthIndex = String(i);
      details.innerHTML = `
        <summary class="annual-outflows-month-summary">
          <span class="annual-outflows-month-toggle" aria-hidden="true">▼</span>
          <div class="annual-outflows-month-summary-inner">
            <div class="annual-outflows-month-summary-row annual-outflows-month-summary-row--title">${escapeHtml(monthName)}</div>
            <div class="annual-outflows-month-summary-row annual-outflows-month-summary-row--recap">
              <span class="annual-outflows-recap-charges">${escapeHtml(chargesRecap)}</span>
              <span class="annual-outflows-recap-sep" aria-hidden="true"></span>
              <span class="annual-outflows-recap-budgets">${escapeHtml(budgetsRecap)}</span>
            </div>
          </div>
        </summary>
        <div class="annual-outflows-month-content">
          <div class="annual-outflows-month-charges" data-month-charges="${i}"></div>
          <div class="annual-outflows-month-budgets" data-month-budgets="${i}"></div>
        </div>
      `;

      const chargesContainer = details.querySelector('[data-month-charges]')!;
      const chargeGroup = document.createElement('buddj-charge-group');
      chargeGroup.setAttribute('title', 'Charges');
      chargeGroup.setAttribute('show-add', '');
      chargeGroup.setAttribute('add-label', 'Ajouter une charge');
      chargeGroup.setAttribute('add-title', 'Ajouter une charge');
      chargeGroup.setAttribute('add-align', 'right');
      for (const c of data.charges) {
        const item = document.createElement('buddj-charge-item');
        item.setAttribute('icon', c.icon);
        item.setAttribute('label', c.label);
        item.setAttribute('amount', String(c.amount));
        if (c.taken) item.setAttribute('taken', '');
        item.setAttribute('no-label-toggle', '');
        chargeGroup.appendChild(item);
      }
      chargesContainer.appendChild(chargeGroup);

      const budgetsContainer = details.querySelector('[data-month-budgets]')!;
      const budgetGroup = document.createElement('buddj-budget-group');
      budgetGroup.setAttribute('title', 'Budgets');
      budgetGroup.setAttribute('show-add', '');
      budgetGroup.setAttribute('add-align', 'right');
      budgetGroup.setAttribute('template-mode', '');
      for (const b of data.budgets) {
        const card = document.createElement('buddj-template-budget-card');
        card.setAttribute('name', b.name);
        card.setAttribute('icon', b.icon);
        card.setAttribute('allocated', String(b.allocated));
        budgetGroup.appendChild(card);
      }
      budgetsContainer.appendChild(budgetGroup);

      sectionsEl.appendChild(details);
    }

    this.innerHTML = '';
    this.appendChild(main);
  }

  private attachListeners(): void {
    this.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (target.closest('.annual-outflows-search')) {
        e.preventDefault();
        const drawer = document.getElementById('annual-outflows-search-drawer') as HTMLElement & { open: () => void };
        drawer?.open();
        return;
      }
    });
    this.addEventListener('buddj-budget-deleted', (e) => {
      const card = (e.target as Element).closest('buddj-template-budget-card');
      if (!card) return;
      const monthBlock = card.closest('details.annual-outflows-month');
      const idx = monthBlock ? parseInt(monthBlock.getAttribute('data-month-index') ?? '-1', 10) : -1;
      if (idx < 0 || idx >= this._months.length) return;
      const name = card.getAttribute('name') ?? '';
      this._months[idx]!.budgets = this._months[idx]!.budgets.filter((b) => b.name !== name);
      this.render();
    });
  }
}

customElements.define(BuddjScreenAnnualOutflows.tagName, BuddjScreenAnnualOutflows);
