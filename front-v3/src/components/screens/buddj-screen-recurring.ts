/**
 * Écran Charges récurrentes : header avec icône recherche + section avec titre, groupes de charges construits à partir d’un tableau de données.
 * Filtrage en temps réel par intitulé ou montant via le drawer de recherche.
 */
import type { BuddjChargeAddDrawerElement } from '../organisms/buddj-charge-add-drawer.js';
import type { BuddjChargeSearchDrawerElement } from '../organisms/buddj-charge-search-drawer.js';
import type { BuddjSearchDrawerElement } from '../organisms/buddj-search-drawer.js';
import { entryMatchesSearch } from '../../shared/search.js';
import type { ChargeGroupData } from '../../application/month/month-types.js';
import { escapeAttr } from '../../shared/escape.js';
import type { MonthStore } from '../../application/month/month-store.js';
import {
  LOADING_CREATE_OUTFLOW_TEXT,
  LOADING_DELETE_OUTFLOW_TEXT,
  LOADING_OUTFLOWS_CHECKING_TEXT,
  type CreateOutflowActionDetail,
  type DeleteOutflowActionDetail,
  type PutOutflowsCheckingActionDetail,
} from '../../application/month/month-store.js';
import type { MonthView } from '../../application/month/month-view.js';
import { getCurrentMonth } from '../../application/month/month-state.js';
import type { BuddjLoadingModal } from '../molecules/buddj-loading-modal.js';
import { parseEurosToNumber } from '../../shared/goal.js';
import { getToast } from '../atoms/buddj-toast.js';

const LOADING_MONTHS_TEXT = 'Chargement des mois en cours';

export class BuddjScreenRecurring extends HTMLElement {
  static readonly tagName = 'buddj-screen-recurring';
  private _monthStore?: MonthStore;
  private _monthListenersAttached = false;
  private _chargeGroups: ChargeGroupData[] = [];
  private _loadingModal?: BuddjLoadingModal;

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
    if (this.querySelector('#recurring')) return;
    this._attachMonthStoreListeners();
    this.attachListeners();
    document.addEventListener('buddj-charge-search', this._searchListener);
    document.addEventListener('buddj-charge-add-done', this._onChargeAddDone as EventListener);
  }

  disconnectedCallback(): void {
    document.removeEventListener('buddj-charge-search', this._searchListener);
    document.removeEventListener('buddj-charge-add-done', this._onChargeAddDone as EventListener);
    this.removeEventListener('buddj-charge-taken-change', this._onChargeTakenChange as EventListener);
    this.removeEventListener('buddj-charge-delete-confirmed', this._onChargeDeleteConfirmed as EventListener);
    this._detachMonthStoreListeners();
  }

  private _showEmptyMonthsPlaceholder(): boolean {
    if (!this._monthStore) return false;
    const s = this._monthStore.getState();
    return !s.isLoadingMonths && s.months.length === 0;
  }

  private _renderEmptyMonthsPlaceholder(): void {
    const main = document.createElement('main');
    main.id = 'recurring';
    main.className = 'screen screen--recurring';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap">
        <header class="screen-header">
          <div class="screen-header-row screen-header-row--title">
            <h1 class="title">Charges récurrentes</h1>
          </div>
        </header>
      </div>
      <section class="recurring-list"></section>
    `;
    main.querySelector('.recurring-list')!.appendChild(document.createElement('buddj-months-empty-placeholder'));
    if (this._loadingModal) this.replaceChildren(main, this._loadingModal);
    else this.replaceChildren(main);
  }

  private render(): void {
    if (this._showEmptyMonthsPlaceholder()) {
      this._renderEmptyMonthsPlaceholder();
      return;
    }
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
      groupEl.setAttribute('hide-recap', '');
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
        if (charge.id) itemEl.setAttribute('outflow-id', charge.id);
        itemEl.setAttribute('icon', charge.icon);
        itemEl.setAttribute('label', charge.label);
        itemEl.setAttribute('amount', String(charge.amount));
        if (charge.taken) itemEl.setAttribute('taken', '');
        if (charge.previous) itemEl.setAttribute('previous', '');
        groupEl.appendChild(itemEl);
      }
      listSection.appendChild(groupEl);
    }
    if (this._loadingModal) this.replaceChildren(main, this._loadingModal);
    else this.replaceChildren(main);
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
    this.addEventListener('buddj-charge-taken-change', this._onChargeTakenChange as EventListener);
    this.addEventListener('buddj-charge-delete-confirmed', this._onChargeDeleteConfirmed as EventListener);
  }

  private _onChargeAddDone = (e: Event): void => {
    if (!this._monthStore) return;
    const ev = e as CustomEvent<{ label: string; amount: string; emoji: string }>;
    const rawLabel = ev.detail?.label?.trim() ?? '';
    const emoji = ev.detail?.emoji?.trim() ?? '';
    const amount = parseEurosToNumber(ev.detail?.amount ?? '0');
    if (!rawLabel || amount <= 0) return;
    const apiLabel = `${emoji} ${rawLabel}`.trim();
    const payload: CreateOutflowActionDetail = { label: apiLabel, amount };
    this._monthStore.emitAction('createOutflow', payload);
  };

  private _onCurrentMonthChanged = (e: Event): void => {
    const month = (e as CustomEvent<{ month: MonthView | null }>).detail?.month;
    this._chargeGroups = month?.chargeGroups ?? [];
    this.render();
    const searchDrawer = document.getElementById('charge-search-drawer') as BuddjChargeSearchDrawerElement | null;
    const shell = searchDrawer?.querySelector('buddj-search-drawer') as BuddjSearchDrawerElement | null;
    shell?.refresh();
  };

  private _onChargeDeleteConfirmed = (e: Event): void => {
    if (!this._monthStore) return;
    const ev = e as CustomEvent<Partial<DeleteOutflowActionDetail>>;
    const outflowId = ev.detail?.outflowId;
    if (!outflowId) return;
    this._monthStore.emitAction('deleteOutflow', { outflowId });
  };

  private _onChargeTakenChange = (e: Event): void => {
    if (!this._monthStore) return;
    const ev = e as CustomEvent<Partial<PutOutflowsCheckingActionDetail>>;
    const { outflowId, isChecked } = ev.detail ?? {};
    if (!outflowId || isChecked === undefined) return;
    this._monthStore.emitAction('putOutflowsChecking', { outflowId, isChecked });
  };

  private _attachMonthStoreListeners(): void {
    if (!this._monthStore || this._monthListenersAttached) return;
    this._monthListenersAttached = true;
    const loadingModal = document.createElement('buddj-loading-modal') as BuddjLoadingModal;
    this._loadingModal = loadingModal;
    this.appendChild(loadingModal);
    this._monthStore.addEventListener('unarchivedMonthsLoading', this._onUnarchivedMonthsLoading);
    this._monthStore.addEventListener('unarchivedMonthsLoaded', this._onUnarchivedMonthsLoaded);
    this._monthStore.addEventListener('unarchivedMonthsLoadFailed', this._onUnarchivedMonthsLoaded);
    this._monthStore.addEventListener('currentMonthChanged', this._onCurrentMonthChanged);
    this._monthStore.addEventListener('outflowCreateLoading', this._onOutflowCreateLoading);
    this._monthStore.addEventListener('outflowCreateLoaded', this._onOutflowCreateLoaded);
    this._monthStore.addEventListener('outflowCreateFailed', this._onOutflowCreateFailed);
    this._monthStore.addEventListener('outflowDeleteLoading', this._onOutflowDeleteLoading);
    this._monthStore.addEventListener('outflowDeleteLoaded', this._onOutflowDeleteLoaded);
    this._monthStore.addEventListener('outflowDeleteFailed', this._onOutflowDeleteFailed);
    this._monthStore.addEventListener('outflowsCheckingLoading', this._onOutflowsCheckingLoading);
    this._monthStore.addEventListener('outflowsCheckingLoaded', this._onOutflowsCheckingLoaded);
    this._monthStore.addEventListener('outflowsCheckingFailed', this._onOutflowsCheckingFailed);
    const s = this._monthStore.getState();
    if (s.months.length === 0 && !s.isLoadingMonths) {
      this._monthStore.emitAction('loadUnarchivedMonths');
    }
    this._chargeGroups = getCurrentMonth({ state: this._monthStore.getState() })?.chargeGroups ?? [];
    this.render();
  }

  private _detachMonthStoreListeners(): void {
    if (!this._monthStore || !this._monthListenersAttached) return;
    this._monthStore.removeEventListener('unarchivedMonthsLoading', this._onUnarchivedMonthsLoading);
    this._monthStore.removeEventListener('unarchivedMonthsLoaded', this._onUnarchivedMonthsLoaded);
    this._monthStore.removeEventListener('unarchivedMonthsLoadFailed', this._onUnarchivedMonthsLoaded);
    this._monthStore.removeEventListener('currentMonthChanged', this._onCurrentMonthChanged);
    this._monthStore.removeEventListener('outflowCreateLoading', this._onOutflowCreateLoading);
    this._monthStore.removeEventListener('outflowCreateLoaded', this._onOutflowCreateLoaded);
    this._monthStore.removeEventListener('outflowCreateFailed', this._onOutflowCreateFailed);
    this._monthStore.removeEventListener('outflowDeleteLoading', this._onOutflowDeleteLoading);
    this._monthStore.removeEventListener('outflowDeleteLoaded', this._onOutflowDeleteLoaded);
    this._monthStore.removeEventListener('outflowDeleteFailed', this._onOutflowDeleteFailed);
    this._monthStore.removeEventListener('outflowsCheckingLoading', this._onOutflowsCheckingLoading);
    this._monthStore.removeEventListener('outflowsCheckingLoaded', this._onOutflowsCheckingLoaded);
    this._monthStore.removeEventListener('outflowsCheckingFailed', this._onOutflowsCheckingFailed);
    this._monthListenersAttached = false;
    this._loadingModal?.hide();
    this._loadingModal = undefined;
  }

  private _onUnarchivedMonthsLoading = (): void => {
    this._loadingModal?.show(LOADING_MONTHS_TEXT);
  };

  private _onUnarchivedMonthsLoaded = (): void => {
    this._loadingModal?.hide();
  };

  private _onOutflowCreateLoading = (): void => {
    this._loadingModal?.show(LOADING_CREATE_OUTFLOW_TEXT);
  };

  private _onOutflowCreateLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'La charge a bien été ajoutée' });
  };

  private _onOutflowCreateFailed = (e: Event): void => {
    this._loadingModal?.hide();
    const msg = (e as CustomEvent<{ message: string }>).detail?.message ?? 'Erreur lors de l’ajout de la charge';
    getToast()?.show({ message: msg, variant: 'error', durationMs: 1250 });
  };

  private _onOutflowDeleteLoading = (): void => {
    this._loadingModal?.show(LOADING_DELETE_OUTFLOW_TEXT);
  };

  private _onOutflowDeleteLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'La charge a bien été supprimée' });
  };

  private _onOutflowDeleteFailed = (e: Event): void => {
    this._loadingModal?.hide();
    const msg = (e as CustomEvent<{ message: string }>).detail?.message ?? 'Erreur lors de la suppression de la charge';
    getToast()?.show({ message: msg, variant: 'error', durationMs: 1250 });
  };

  private _onOutflowsCheckingLoading = (): void => {
    this._loadingModal?.show(LOADING_OUTFLOWS_CHECKING_TEXT);
  };

  private _onOutflowsCheckingLoaded = (): void => {
    this._loadingModal?.hide();
    getToast()?.show({ message: 'La charge a bien été mise à jour' });
  };

  private _onOutflowsCheckingFailed = (e: Event): void => {
    this._loadingModal?.hide();
    const msg = (e as CustomEvent<{ message: string }>).detail?.message ?? 'Erreur lors de la mise à jour de la charge';
    getToast()?.show({ message: msg, variant: 'error', durationMs: 1250 });
  };
}

customElements.define(BuddjScreenRecurring.tagName, BuddjScreenRecurring);
