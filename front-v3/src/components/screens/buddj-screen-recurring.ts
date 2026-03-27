/**
 * Écran Charges récurrentes : header avec icône recherche + section avec titre, groupes de charges construits à partir d’un tableau de données.
 * Filtrage en temps réel par intitulé ou montant via le drawer de recherche.
 */
import type { BuddjChargeAddDrawerElement } from '../organisms/buddj-charge-add-drawer.js';
import type { BuddjChargeSearchDrawerElement } from '../organisms/buddj-charge-search-drawer.js';
import { entryMatchesSearch } from '../../shared/search.js';
import type { ChargeGroupData } from '../../application/month/month-types.js';
import { escapeAttr } from '../../shared/escape.js';
import type { MonthStore } from '../../application/month/month-store.js';
import type { MonthView } from '../../application/month/month-view.js';
import { getCurrentMonth } from '../../application/month/month-state.js';

export class BuddjScreenRecurring extends HTMLElement {
  static readonly tagName = 'buddj-screen-recurring';
  private _monthStore?: MonthStore;
  private _monthListenersAttached = false;
  private _chargeGroups: ChargeGroupData[] = [];

  init({ monthStore }: { monthStore: MonthStore }): void {
    this._monthStore = monthStore;
  }

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
    this.render();
    this.attachListeners();
    document.addEventListener('buddj-charge-search', this._searchListener);
    this._attachMonthStoreListeners();
  }

  disconnectedCallback(): void {
    document.removeEventListener('buddj-charge-search', this._searchListener);
    this._detachMonthStoreListeners();
  }

  private render(): void {
    const headerAddCharge = this._chargeGroups.find((g) => g.showAdd);
    const headerAddChargeTitleAttr = escapeAttr(
      headerAddCharge?.addTitle ?? 'Ajouter une charge récurrente'
    );
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
              headerAddCharge
                ? `<buddj-btn-add label="" title="${headerAddChargeTitleAttr}" data-header-add-charge></buddj-btn-add>`
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
    for (const group of this._chargeGroups) {
      const groupEl = document.createElement('buddj-charge-group');
      if (group.previous) groupEl.setAttribute('previous', '');
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
    this.replaceChildren(main);
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

  private _onCurrentMonthChanged = (e: Event): void => {
    const month = (e as CustomEvent<{ month: MonthView | null }>).detail?.month;
    this._chargeGroups = month?.chargeGroups ?? [];
    this.render();
  };

  private _attachMonthStoreListeners(): void {
    if (!this._monthStore || this._monthListenersAttached) return;
    this._monthListenersAttached = true;
    this._monthStore.addEventListener('currentMonthChanged', this._onCurrentMonthChanged);
    const month = getCurrentMonth({ state: this._monthStore.getState() });
    this._chargeGroups = month?.chargeGroups ?? [];
    this.render();
    if (!month) this._monthStore.emitAction('loadUnarchivedMonths');
  }

  private _detachMonthStoreListeners(): void {
    if (!this._monthStore || !this._monthListenersAttached) return;
    this._monthStore.removeEventListener('currentMonthChanged', this._onCurrentMonthChanged);
    this._monthListenersAttached = false;
  }
}

customElements.define(BuddjScreenRecurring.tagName, BuddjScreenRecurring);
