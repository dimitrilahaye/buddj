/**
 * Écran Charges récurrentes : header avec icône recherche + section avec titre, groupes de charges construits à partir d’un tableau de données.
 * Filtrage en temps réel par intitulé ou montant via le drawer de recherche.
 */
import type { BuddjChargeAddDrawerElement } from '../organisms/buddj-charge-add-drawer.js';
import type { BuddjChargeSearchDrawerElement } from '../organisms/buddj-charge-search-drawer.js';
import { entryMatchesSearch } from '../../shared/search.js';
import type { ChargeGroupData } from '../../application/month/month-types.js';
import { escapeAttr } from '../../shared/escape.js';

const CHARGE_GROUPS: ChargeGroupData[] = [
  {
    previous: true,
    charges: [
      { icon: '🏠', label: 'Loyer', amount: 650, previous: true },
      { icon: '🛡️', label: "Assurance auto pour l'année passée", amount: 45, taken: true, previous: true },
    ],
  },
  {
    title: 'Charges annuelles',
    annual: true,
    charges: [
      { icon: '🛡️', label: 'Assurance habitation', amount: 420 },
      { icon: '📋', label: 'Contrôle chaudière', amount: 120, taken: true },
    ],
  },
  {
    title: "Charges d'Avril 2024",
    showAdd: true,
    addLabel: 'Ajouter une charge',
    addTitle: 'Ajouter une charge récurrente',
    charges: [
      { icon: '🏠', label: 'Loyer', amount: 650, taken: true },
      { icon: '⚡', label: 'Électricité', amount: 82 },
      { icon: '🛡️', label: 'Assurance auto', amount: 45, taken: true },
      { icon: '📶', label: 'Internet', amount: 29.99, taken: true },
      { icon: '💪', label: 'Abonnement sport', amount: 39 },
    ],
  },
];

const HEADER_ADD_CHARGE = CHARGE_GROUPS.find((g) => g.showAdd);
const HEADER_ADD_CHARGE_TITLE_ATTR = escapeAttr(
  HEADER_ADD_CHARGE?.addTitle ?? 'Ajouter une charge récurrente'
);

export class BuddjScreenRecurring extends HTMLElement {
  static readonly tagName = 'buddj-screen-recurring';

  private _searchListener = (e: Event): void => {
    const ev = e as CustomEvent<{ query: string }>;
    const query = (ev.detail?.query ?? '').trim();
    const main = this.querySelector('#recurring');
    if (!main) return;
    const items = main.querySelectorAll('buddj-charge-item');
    items.forEach((item) => {
      const label = item.getAttribute('label') ?? '';
      const amount = item.getAttribute('amount') ?? '';
      const match = entryMatchesSearch(label, amount, query);
      (item as HTMLElement).style.display = match ? '' : 'none';
    });
  };

  connectedCallback(): void {
    if (this.querySelector('.recurring-list')) return;
    const main = document.createElement('main');
    main.id = 'recurring';
    main.className = 'screen screen--recurring';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap">
        <header class="screen-header">
          <div class="screen-header-row screen-header-row--title">
            <h1 class="title">Charges récurrentes</h1>
            <buddj-icon-search title="Rechercher par intitulé ou montant" aria-label="Ouvrir la recherche"></buddj-icon-search>
            ${
              HEADER_ADD_CHARGE
                ? `<buddj-btn-add label="" title="${HEADER_ADD_CHARGE_TITLE_ATTR}" data-header-add-charge></buddj-btn-add>`
                : ''
            }
          </div>
        </header>
      </div>
      <section class="recurring-list">
        <buddj-section-header></buddj-section-header>
      </section>
    `;
    const listSection = main.querySelector('.recurring-list')!;
    for (const group of CHARGE_GROUPS) {
      const groupEl = document.createElement('buddj-charge-group');
      if (group.previous) groupEl.setAttribute('previous', '');
      if (group.annual) groupEl.setAttribute('annual', '');
      if (group.title) groupEl.setAttribute('title', group.title);
      if (group.showAdd) {
        groupEl.setAttribute('show-add', '');
        groupEl.setAttribute('hide-inline-add', '');
      }
      if (group.addLabel) groupEl.setAttribute('add-label', group.addLabel);
      if (group.addTitle) groupEl.setAttribute('add-title', group.addTitle);
      for (const charge of group.charges) {
        const itemEl = document.createElement('buddj-charge-item');
        itemEl.setAttribute('icon', charge.icon);
        itemEl.setAttribute('label', charge.label);
        itemEl.setAttribute('amount', String(charge.amount));
        if (charge.taken) itemEl.setAttribute('taken', '');
        if (charge.previous) itemEl.setAttribute('previous', '');
        groupEl.appendChild(itemEl);
      }
      listSection.appendChild(groupEl);
    }
    this.appendChild(main);
    this.attachListeners();
    document.addEventListener('buddj-charge-search', this._searchListener);
  }

  disconnectedCallback(): void {
    document.removeEventListener('buddj-charge-search', this._searchListener);
  }

  private attachListeners(): void {
    this.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (target.closest('buddj-icon-search')) {
        e.preventDefault();
        const drawer = document.getElementById('charge-search-drawer') as BuddjChargeSearchDrawerElement;
        drawer?.open();
        return;
      }
      if (target.closest('[data-header-add-charge]')) {
        e.preventDefault();
        const drawer = document.getElementById('charge-add-drawer') as BuddjChargeAddDrawerElement;
        drawer?.open();
      }
    });
  }
}

customElements.define(BuddjScreenRecurring.tagName, BuddjScreenRecurring);
