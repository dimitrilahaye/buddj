/**
 * Écran Détail d’un template : total charges + budgets, switch « Par défaut »,
 * sections repliables (charges récurrentes mensuelles, budgets mensuels) avec recherche, ajout, suppression.
 */
import type { ChargeItemData } from '../../application/month/month-types.js';
import { getToast } from '../atoms/buddj-toast.js';
import { formatEuros } from '../../shared/goal.js';
import { escapeHtml } from '../../shared/escape.js';
import { entryMatchesSearch } from '../../shared/search.js';
import { TEMPLATE_DEFAULT_CHANGED } from './buddj-screen-templates.js';

const TEMPLATE_CHARGES: ChargeItemData[] = [
  { icon: '🏠', label: 'Loyer', amount: 650 },
  { icon: '⚡', label: 'Électricité', amount: 82 },
  { icon: '🛡️', label: 'Assurance auto', amount: 45 },
  { icon: '📶', label: 'Internet', amount: 29.99 },
  { icon: '💪', label: 'Abonnement sport', amount: 39 },
];

const TEMPLATE_NAMES: Record<string, string> = {
  t1: 'Mon template principal',
  t2: 'Vacances',
  t3: 'Déménagement',
  t4: 'Rentrée scolaire',
  t5: 'Noël',
  t6: 'Travaux maison',
  t7: 'Mariage',
  t8: 'Projet voiture',
  t9: 'Sport & bien-être',
  t10: 'Abonnements',
  t11: 'Courses & alimentation',
  t12: 'Loisirs',
  t13: 'Santé',
  t14: 'Enfants',
  t15: 'Animaux',
  t16: 'Impot sur le revenu',
  t17: 'Épargne projet',
  t18: 'Cadeaux',
  t19: 'Restaurant & sorties',
  t20: 'Vacances été',
  t21: 'Vacances ski',
  t22: 'Assurances',
  t23: 'Énergie',
  t24: 'Télécom',
  t25: 'Crédit immobilier',
};

const TEMPLATE_BUDGETS: { name: string; icon: string; allocated: number }[] = [
  { name: 'Vacances', icon: '🏖️', allocated: 350 },
  { name: 'Sorties', icon: '🎬', allocated: 120 },
  { name: 'Alimentation', icon: '🛒', allocated: 400 },
  { name: 'Transport', icon: '🚗', allocated: 150 },
  { name: 'Santé', icon: '💊', allocated: 80 },
  { name: 'Loisirs', icon: '🎮', allocated: 100 },
  { name: 'Vêtements', icon: '👕', allocated: 75 },
  { name: 'Équipement maison', icon: '🛋️', allocated: 200 },
  { name: 'Cadeaux', icon: '🎁', allocated: 50 },
  { name: 'Restaurants', icon: '🍽️', allocated: 180 },
  { name: 'Abonnements', icon: '📱', allocated: 45 },
  { name: 'Épargne projet', icon: '🏠', allocated: 300 },
  { name: 'Noël', icon: '🎄', allocated: 250 },
  { name: 'Anniversaires', icon: '🎂', allocated: 60 },
  { name: 'Sport', icon: '⚽', allocated: 90 },
  { name: 'Culture', icon: '🎭', allocated: 55 },
  { name: 'Bricolage', icon: '🔧', allocated: 120 },
  { name: 'Jardin', icon: '🌱', allocated: 40 },
  { name: 'Animaux', icon: '🐕', allocated: 65 },
  { name: 'Enfants école', icon: '📚', allocated: 85 },
];

export class BuddjScreenTemplateDetail extends HTMLElement {
  static readonly tagName = 'buddj-screen-template-detail';

  private _templateId = '';
  private _templateName = 'Template';
  private _isDefault = true;
  private _charges: ChargeItemData[] = [...TEMPLATE_CHARGES];
  private _budgets: { name: string; icon: string; allocated: number }[] = [...TEMPLATE_BUDGETS];
  private _chargeSearchListener = (e: Event): void => {
    const ev = e as CustomEvent<{ query: string }>;
    const query = (ev.detail?.query ?? '').trim();
    const main = this.querySelector('#template-detail');
    if (!main) return;
    main.querySelectorAll('buddj-charge-item').forEach((item) => {
      const label = item.getAttribute('label') ?? '';
      const amount = item.getAttribute('amount') ?? '';
      const match = entryMatchesSearch(label, amount, query);
      (item as HTMLElement).style.display = match ? '' : 'none';
    });
  };
  private _expenseSearchListener = (e: Event): void => {
    const ev = e as CustomEvent<{ query: string }>;
    const query = (ev.detail?.query ?? '').trim();
    const main = this.querySelector('#template-detail');
    if (!main) return;
    main.querySelectorAll('buddj-expense-item').forEach((item) => {
      const desc = item.getAttribute('desc') ?? '';
      const amount = item.getAttribute('amount') ?? '';
      const match = entryMatchesSearch(desc, amount, query);
      (item as HTMLElement).style.display = match ? '' : 'none';
    });
  };

  static get observedAttributes(): string[] {
    return ['template-id', 'is-default'];
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (name === 'template-id') {
      this._templateId = newValue ?? '';
      this._templateName = TEMPLATE_NAMES[this._templateId] ?? 'Template';
    }
    if (name === 'is-default') this._isDefault = newValue !== null && newValue !== 'false';
    if (this.querySelector('#template-detail')) this.render();
  }

  connectedCallback(): void {
    this._templateId = this.getAttribute('template-id') ?? '';
    this._templateName = TEMPLATE_NAMES[this._templateId] ?? 'Template';
    this._isDefault = this.getAttribute('is-default') !== 'false';
    if (this.querySelector('#template-detail')) return;
    this.render();
    this.attachListeners();
    document.addEventListener('buddj-charge-search', this._chargeSearchListener);
    document.addEventListener('buddj-expense-search', this._expenseSearchListener);
  }

  disconnectedCallback(): void {
    document.removeEventListener('buddj-charge-search', this._chargeSearchListener);
    document.removeEventListener('buddj-expense-search', this._expenseSearchListener);
  }

  private getTotalCharges(): number {
    return this._charges.reduce((s, c) => s + c.amount, 0);
  }

  private getTotalBudgets(): number {
    return this._budgets.reduce((s, b) => s + b.allocated, 0);
  }

  private getTotal(): number {
    return this.getTotalCharges() + this.getTotalBudgets();
  }

  private render(): void {
    const total = this.getTotal();
    const chargesTotal = this.getTotalCharges();
    const budgetsTotal = this.getTotalBudgets();

    const main = document.createElement('main');
    main.id = 'template-detail';
    main.className = 'screen screen--template-detail';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap template-detail-sticky-wrap">
        <header class="new-month-header template-detail-header">
          <div class="template-detail-header-row">
            <a href="/templates" class="template-detail-back" aria-label="Retour aux templates">←</a>
            <h1 class="new-month-title">${escapeHtml(this._templateName)}</h1>
            <label class="template-default-switch-wrap">
              <span class="template-default-switch-label">Par défaut</span>
              <span class="template-default-switch-row">
                <input type="checkbox" class="template-default-switch" role="switch" data-default-toggle aria-label="Template par défaut" ${this._isDefault ? 'checked' : ''}>
              </span>
            </label>
          </div>
        </header>
        <div class="new-month-projected-sticky" aria-live="polite">
          <span class="new-month-projected-label">Total charges et budgets</span>
          <span class="new-month-projected" data-new-month-projected>${escapeHtml(formatEuros(total))}</span>
        </div>
        <div class="template-detail-tabs" role="tablist" aria-label="Charges ou budgets">
          <button type="button" class="template-detail-tab template-detail-tab--active" role="tab" data-tab="charges" aria-selected="true">Charges</button>
          <button type="button" class="template-detail-tab" role="tab" data-tab="budgets" aria-selected="false">Budgets</button>
        </div>
      </div>
      <section class="template-detail-sections">
        <div class="template-detail-panel" data-panel="charges" role="tabpanel">
          <div class="template-section-content" data-charges-container></div>
        </div>
        <div class="template-detail-panel template-detail-panel--hidden" data-panel="budgets" role="tabpanel" hidden>
          <div class="template-section-content" data-budgets-container></div>
        </div>
      </section>
    `;

    const chargesContainer = main.querySelector('[data-charges-container]')!;
    const chargeGroup = document.createElement('buddj-charge-group');
    chargeGroup.setAttribute('title', 'Charges récurrentes mensuelles');
    chargeGroup.setAttribute('show-add', '');
    chargeGroup.setAttribute('show-search', '');
    chargeGroup.setAttribute('add-label', 'Ajouter une charge');
    chargeGroup.setAttribute('add-title', 'Ajouter une charge récurrente');
    chargeGroup.setAttribute('recap-count', String(this._charges.length));
    chargeGroup.setAttribute('recap-total', formatEuros(chargesTotal));
    chargeGroup.setAttribute('add-align', 'right');
    for (const c of this._charges) {
      const item = document.createElement('buddj-charge-item');
      item.setAttribute('icon', c.icon);
      item.setAttribute('label', c.label);
      item.setAttribute('amount', String(c.amount));
      if (c.taken) item.setAttribute('taken', '');
      item.setAttribute('no-label-toggle', '');
      chargeGroup.appendChild(item);
    }
    chargesContainer.appendChild(chargeGroup);

    const budgetsContainer = main.querySelector('[data-budgets-container]')!;
    const budgetGroup = document.createElement('buddj-budget-group');
    budgetGroup.setAttribute('title', 'Budgets mensuels');
    budgetGroup.setAttribute('show-add', '');
    budgetGroup.setAttribute('show-search', '');
    budgetGroup.setAttribute('recap-count', String(this._budgets.length));
    budgetGroup.setAttribute('recap-total', formatEuros(budgetsTotal));
    budgetGroup.setAttribute('add-align', 'right');
    budgetGroup.setAttribute('template-mode', '');
    for (const b of this._budgets) {
      const card = document.createElement('buddj-template-budget-card');
      card.setAttribute('name', b.name);
      card.setAttribute('icon', b.icon);
      card.setAttribute('allocated', String(b.allocated));
      budgetGroup.appendChild(card);
    }
    budgetsContainer.appendChild(budgetGroup);

    this.innerHTML = '';
    this.appendChild(main);
  }

  private attachListeners(): void {
    this.addEventListener('buddj-budget-deleted', (e) => {
      const card = (e.target as Element).closest('buddj-template-budget-card');
      if (!card) return;
      const name = card.getAttribute('name') ?? '';
      this._budgets = this._budgets.filter((b) => b.name !== name);
      this.render();
    });
    this.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target.getAttribute('data-default-toggle') !== null && target.getAttribute('role') === 'switch') {
        this._isDefault = (target as HTMLInputElement).checked;
        this.setAttribute('is-default', this._isDefault ? 'true' : 'false');
        document.dispatchEvent(
          new CustomEvent(TEMPLATE_DEFAULT_CHANGED, {
            detail: { templateId: this._templateId, isDefault: this._isDefault },
          })
        );
        const toast = getToast();
        toast?.show({ message: 'Template mis à jour' });
        return;
      }
    });
    this.addEventListener('click', (e) => {
      const target = e.target as Element;
      const tab = target.closest('.template-detail-tab[data-tab]');
      if (tab) {
        e.preventDefault();
        const tabId = tab.getAttribute('data-tab');
        if (!tabId) return;
        this.querySelectorAll('.template-detail-tab').forEach((t) => {
          t.classList.remove('template-detail-tab--active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('template-detail-tab--active');
        tab.setAttribute('aria-selected', 'true');
        this.querySelectorAll('.template-detail-panel').forEach((p) => {
          const panelId = p.getAttribute('data-panel');
          const isActive = panelId === tabId;
          p.classList.toggle('template-detail-panel--hidden', !isActive);
          (p as HTMLElement).hidden = !isActive;
        });
        return;
      }
      if (target.closest('.template-section-search:not(.template-section-search--expenses)')) {
        e.preventDefault();
        const drawer = document.getElementById('charge-search-drawer') as HTMLElement & { open: () => void };
        drawer?.open();
        return;
      }
      if (target.closest('.template-section-search--expenses')) {
        e.preventDefault();
        const drawer = document.getElementById('budget-search-drawer') as HTMLElement & { open: () => void };
        drawer?.open();
        return;
      }
    });
  }
}

customElements.define(BuddjScreenTemplateDetail.tagName, BuddjScreenTemplateDetail);
