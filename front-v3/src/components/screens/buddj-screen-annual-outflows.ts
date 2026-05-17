/**
 * Écran Sorties annuelles : YearlyOutflowsStore + GET/POST/DELETE /yearly-outflows.
 */
import type { YearlyOutflowsStore } from '../../application/yearly-outflows/yearly-outflows-store.js';
import type { YearlyOutflowsView } from '../../application/yearly-outflows/yearly-outflows-view.js';
import { formatEuros } from '../../shared/goal.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import {
  monthBudgetsTotalEuros,
  monthChargesTotalEuros,
  yearlyAveragePerMonthEuros,
  yearlyAveragePerMonthEurosFiltered,
} from '../../application/yearly-outflows/yearly-totals.js';
import {
  isProjectedSimulationActive,
  projectedSimulationKey,
  PROJECTED_SIMULATION_RESET_ICON_SVG,
  type ProjectedSimulationKind,
} from '../../shared/projected-simulation.js';
import { getToast } from '../atoms/buddj-toast.js';
import { splitLeadingEmoji } from '../../shared/emoji-label.js';

/** Libellés des mois (FR) — réutilisés par les tests pour les requêtes par rôle / nom accessible. */
export const ANNUAL_OUTFLOWS_MONTH_LABELS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
] as const;

const DEFAULT_ANNUAL_ICON = '💰';

export class BuddjScreenAnnualOutflows extends HTMLElement {
  static readonly tagName = 'buddj-screen-annual-outflows';

  private _store?: YearlyOutflowsStore;
  private _simulationIncluded = new Map<string, boolean>();
  private _projectedSimulationSession = false;
  private _simulationListenersAttached = false;

  init({ yearlyOutflowsStore }: { yearlyOutflowsStore: YearlyOutflowsStore }): void {
    this._store = yearlyOutflowsStore;
  }

  connectedCallback(): void {
    if (this.querySelector('#annual-outflows')) return;
    const store = this._store;
    if (!store) return;

    this._renderShell();
    store.addEventListener('yearlyOutflowsStateUpdated', this._onStore);
    store.addEventListener('yearlyOutflowsLoadFailed', this._onMutationError);
    store.addEventListener('yearlySavingAddFailed', this._onMutationError);
    store.addEventListener('yearlySavingRemoveFailed', this._onMutationError);
    store.addEventListener('yearlySavingAddLoaded', this._onSuccessAdd);
    store.addEventListener('yearlySavingRemoveLoaded', this._onSuccessRemove);
    document.addEventListener('buddj-annual-charge-add-submit', this._onAnnualChargeAddSubmit);
    document.addEventListener('buddj-annual-budget-add-submit', this._onAnnualBudgetAddSubmit);
    store.emitAction('loadYearlyOutflows');
    this._syncFromStore();
  }

  disconnectedCallback(): void {
    this._store?.removeEventListener('yearlyOutflowsStateUpdated', this._onStore);
    this._store?.removeEventListener('yearlyOutflowsLoadFailed', this._onMutationError);
    this._store?.removeEventListener('yearlySavingAddFailed', this._onMutationError);
    this._store?.removeEventListener('yearlySavingRemoveFailed', this._onMutationError);
    this._store?.removeEventListener('yearlySavingAddLoaded', this._onSuccessAdd);
    this._store?.removeEventListener('yearlySavingRemoveLoaded', this._onSuccessRemove);
    document.removeEventListener('buddj-annual-charge-add-submit', this._onAnnualChargeAddSubmit);
    document.removeEventListener('buddj-annual-budget-add-submit', this._onAnnualBudgetAddSubmit);
  }

  private _onMutationError = ((e: Event) => {
    const d = (e as CustomEvent<{ message?: string }>).detail;
    getToast()?.show({ message: d?.message ?? 'Une erreur est survenue', variant: 'error', durationMs: 3500 });
  }) as EventListener;

  private _onSuccessAdd = ((): void => {
    getToast()?.show({ message: 'Ajout enregistré' });
  }) as EventListener;

  private _onSuccessRemove = ((): void => {
    getToast()?.show({ message: 'Suppression enregistrée' });
  }) as EventListener;

  private _onAnnualChargeAddSubmit = (e: Event): void => {
    const store = this._store;
    if (!store || !this.isConnected) return;
    const d = (e as CustomEvent<{ month: number; label: string; amount: number; emoji: string }>).detail;
    if (!d?.label?.trim() || d.amount <= 0 || d.month < 1 || d.month > 12) return;
    const apiLabel = `${d.emoji ?? DEFAULT_ANNUAL_ICON} ${d.label.trim()}`.trim();
    store.emitAction('addYearlySaving', {
      kind: 'outflow',
      month: d.month,
      label: apiLabel,
      amount: d.amount,
    });
  };

  private _onAnnualBudgetAddSubmit = (e: Event): void => {
    const store = this._store;
    if (!store || !this.isConnected) return;
    const d = (e as CustomEvent<{ month: number; name: string; amount: number; emoji: string }>).detail;
    if (!d?.name?.trim() || d.amount <= 0 || d.month < 1 || d.month > 12) return;
    const apiLabel = `${d.emoji ?? DEFAULT_ANNUAL_ICON} ${d.name.trim()}`.trim();
    store.emitAction('addYearlySaving', {
      kind: 'budget',
      month: d.month,
      label: apiLabel,
      amount: d.amount,
    });
  };

  private _onStore = (): void => {
    this._syncFromStore();
  };

  private _renderShell(): void {
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
        <div class="new-month-projected-sticky" data-annual-projected-sticky aria-live="polite">
          <span class="new-month-projected-label">Total par mois</span>
          <div class="new-month-projected-sticky-end">
            <span class="new-month-projected" data-annual-total-per-month></span>
            <button type="button" class="btn projected-simulation-end" data-end-projected-simulation hidden aria-label="Terminer la simulation" title="Terminer la simulation">${PROJECTED_SIMULATION_RESET_ICON_SVG}</button>
          </div>
        </div>
      </div>
      <p class="annual-outflows-loading" hidden>Chargement…</p>
      <p class="annual-outflows-error" role="alert" hidden></p>
      <section class="annual-outflows-sections" aria-label="Mois de l’année"></section>
    `;
    this.appendChild(main);
    this.attachListeners();
    this._attachSimulationListeners();
  }

  private _syncSimulationKeysFromView({ view }: { view: YearlyOutflowsView }): void {
    const validKeys = new Set<string>();
    for (const month of view.months) {
      for (const o of month.outflows) {
        const key = projectedSimulationKey({ kind: 'charge', id: o.id });
        validKeys.add(key);
        if (!this._simulationIncluded.has(key)) this._simulationIncluded.set(key, true);
      }
      for (const b of month.budgets) {
        const key = projectedSimulationKey({ kind: 'budget', id: b.id });
        validKeys.add(key);
        if (!this._simulationIncluded.has(key)) this._simulationIncluded.set(key, true);
      }
    }
    for (const key of [...this._simulationIncluded.keys()]) {
      if (!validKeys.has(key)) this._simulationIncluded.delete(key);
    }
  }

  private _isSimulationIncluded({
    kind,
    id,
  }: {
    kind: ProjectedSimulationKind;
    id: string;
  }): boolean {
    return this._simulationIncluded.get(projectedSimulationKey({ kind, id })) !== false;
  }

  private _isSimulationActive(): boolean {
    return isProjectedSimulationActive({ inclusionByKey: this._simulationIncluded });
  }

  private _isProjectedSimulationUiActive(): boolean {
    return this._projectedSimulationSession;
  }

  private _getSimulatedAveragePerMonth({ view }: { view: YearlyOutflowsView }): number {
    if (!this._projectedSimulationSession) {
      return yearlyAveragePerMonthEuros({ view });
    }
    return yearlyAveragePerMonthEurosFiltered({
      view,
      isIncluded: ({ kind, id }) => this._isSimulationIncluded({ kind, id }),
    });
  }

  private _updateProjectedSimulationUi(): void {
    const store = this._store;
    const main = this.querySelector('#annual-outflows');
    if (!store || !main) return;
    const { view } = store.getState();
    const simulating = this._isProjectedSimulationUiActive();
    const avg = this._getSimulatedAveragePerMonth({ view });
    const sticky = main.querySelector('[data-annual-projected-sticky]');
    sticky?.classList.toggle('new-month-projected-sticky--simulating', simulating);
    const projected = main.querySelector('[data-annual-total-per-month]');
    projected?.classList.toggle('new-month-projected--simulating', simulating);
    if (projected) projected.textContent = formatEuros(avg);
    const endBtn = main.querySelector('[data-end-projected-simulation]');
    if (endBtn instanceof HTMLElement) endBtn.hidden = !simulating;
  }

  private _endProjectedSimulation(): void {
    this._projectedSimulationSession = false;
    for (const key of this._simulationIncluded.keys()) {
      this._simulationIncluded.set(key, true);
    }
    this.querySelectorAll('buddj-charge-item[projected-simulation]').forEach((item) => {
      item.setAttribute('simulation-included', '');
      const cb = item.querySelector<HTMLInputElement>('input[data-projected-simulation-include="charge"]');
      if (cb) cb.checked = false;
    });
    this.querySelectorAll('buddj-template-budget-card[projected-simulation]').forEach((card) => {
      card.setAttribute('simulation-included', '');
      const cb = card.querySelector<HTMLInputElement>('input[data-projected-simulation-include="budget"]');
      if (cb) cb.checked = false;
    });
    this._updateProjectedSimulationUi();
  }

  private _attachSimulationListeners(): void {
    if (this._simulationListenersAttached) return;
    this._simulationListenersAttached = true;

    this.addEventListener('change', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') return;
      const kind = target.getAttribute('data-projected-simulation-include');
      const rowId = target.getAttribute('data-projected-simulation-row-id');
      if (kind !== 'charge' && kind !== 'budget') return;
      if (!rowId) return;
      this._projectedSimulationSession = true;
      this._simulationIncluded.set(projectedSimulationKey({ kind, id: rowId }), !target.checked);
      this._updateProjectedSimulationUi();
    });

    this.addEventListener('click', (e) => {
      if ((e.target as Element).closest('[data-end-projected-simulation]')) {
        e.preventDefault();
        this._endProjectedSimulation();
      }
    });
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

    this.addEventListener('buddj-charge-delete-confirmed', (e) => {
      const d = (e as CustomEvent<{ outflowId: string }>).detail;
      if (!d?.outflowId || !this._store) return;
      this._store.emitAction('removeYearlySaving', { id: d.outflowId });
    });

    this.addEventListener('buddj-template-budget-delete-confirmed', (e) => {
      const d = (e as CustomEvent<{ budgetId: string }>).detail;
      if (!d?.budgetId || !this._store) return;
      this._store.emitAction('removeYearlySaving', { id: d.budgetId });
    });
  }

  private _syncFromStore(): void {
    const store = this._store;
    const main = this.querySelector('#annual-outflows');
    if (!store || !main) return;

    const { view, isLoading, loadErrorMessage } = store.getState();
    const loadingEl = main.querySelector('.annual-outflows-loading');
    const errEl = main.querySelector('.annual-outflows-error');
    const sectionsEl = main.querySelector('.annual-outflows-sections');
    if (loadingEl instanceof HTMLElement) {
      loadingEl.hidden = !isLoading;
    }
    if (errEl instanceof HTMLElement) {
      const show = Boolean(loadErrorMessage) && !isLoading;
      errEl.hidden = !show;
      errEl.textContent = loadErrorMessage ?? '';
    }

    this._syncSimulationKeysFromView({ view });
    this._updateProjectedSimulationUi();

    if (!sectionsEl) return;
    if (isLoading && view.months.every((m) => m.outflows.length === 0 && m.budgets.length === 0)) {
      sectionsEl.innerHTML = '';
      return;
    }
    if (loadErrorMessage) {
      sectionsEl.innerHTML = '';
      return;
    }

    const openApiMonths = new Set<number>();
    main.querySelectorAll('details.annual-outflows-month').forEach((node) => {
      const el = node as HTMLDetailsElement;
      if (el.open) {
        const m = el.dataset.apiMonth;
        if (m) openApiMonths.add(parseInt(m, 10));
      }
    });

    sectionsEl.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const apiMonth = i + 1;
      const monthName = ANNUAL_OUTFLOWS_MONTH_LABELS_FR[i]!;
      const data = view.months[i]!;
      const chargesTotal = monthChargesTotalEuros({ month: data });
      const budgetsTotal = monthBudgetsTotalEuros({ month: data });
      const chargesRecap = `${data.outflows.length} charge${data.outflows.length !== 1 ? 's' : ''} — ${formatEuros(chargesTotal)}`;
      const budgetsRecap = `${data.budgets.length} budget${data.budgets.length !== 1 ? 's' : ''} — ${formatEuros(budgetsTotal)}`;

      const details = document.createElement('details');
      details.className = 'annual-outflows-month';
      details.dataset.monthIndex = String(i);
      details.dataset.apiMonth = String(apiMonth);
      details.innerHTML = `
        <summary class="annual-outflows-month-summary">
          <span class="annual-outflows-month-toggle" aria-hidden="true">▼</span>
          <div class="annual-outflows-month-summary-inner">
            <div class="annual-outflows-month-summary-row annual-outflows-month-summary-row--title">${escapeHtml(monthName)}</div>
            <div class="annual-outflows-month-summary-row annual-outflows-month-summary-row--recap">
              <span class="annual-outflows-recap-charges" role="status" aria-label="${escapeAttr(`Récapitulatif des charges pour ${monthName}`)}">${escapeHtml(chargesRecap)}</span>
              <span class="annual-outflows-recap-sep" aria-hidden="true"></span>
              <span class="annual-outflows-recap-budgets" role="status" aria-label="${escapeAttr(`Récapitulatif des budgets pour ${monthName}`)}">${escapeHtml(budgetsRecap)}</span>
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
      chargeGroup.setAttribute('section-title', 'Charges');
      chargeGroup.setAttribute('show-add', '');
      chargeGroup.setAttribute('annual-month', String(apiMonth));
      chargeGroup.setAttribute('add-label', 'Ajouter une charge');
      chargeGroup.setAttribute('add-title', 'Ajouter une charge annuelle');
      chargeGroup.setAttribute('add-align', 'right');
      chargeGroup.setAttribute('annual', '');
      for (const c of data.outflows) {
        const parsed = splitLeadingEmoji({ label: c.label, defaultIcon: DEFAULT_ANNUAL_ICON });
        const item = document.createElement('buddj-charge-item');
        item.setAttribute('outflow-id', c.id);
        item.setAttribute('icon', parsed.icon);
        item.setAttribute('label', parsed.text || c.label);
        item.setAttribute('amount', String(c.amount));
        item.setAttribute('projected-simulation', '');
        item.setAttribute(
          'simulation-included',
          this._isSimulationIncluded({ kind: 'charge', id: c.id }) ? '' : 'false',
        );
        item.setAttribute('hide-taken', '');
        chargeGroup.appendChild(item);
      }
      chargesContainer.appendChild(chargeGroup);

      const budgetsContainer = details.querySelector('[data-month-budgets]')!;
      const budgetGroup = document.createElement('buddj-budget-group');
      budgetGroup.setAttribute('section-title', 'Budgets');
      budgetGroup.setAttribute('show-add', '');
      budgetGroup.setAttribute('annual-month', String(apiMonth));
      budgetGroup.setAttribute('add-align', 'right');
      budgetGroup.setAttribute('template-mode', '');
      budgetGroup.setAttribute('annual', '');
      for (const b of data.budgets) {
        const parsed = splitLeadingEmoji({ label: b.name, defaultIcon: DEFAULT_ANNUAL_ICON });
        const card = document.createElement('buddj-template-budget-card');
        card.setAttribute('budget-id', b.id);
        card.setAttribute('name', parsed.text || b.name);
        card.setAttribute('icon', parsed.icon);
        card.setAttribute('allocated', String(b.initialBalance));
        card.setAttribute('projected-simulation', '');
        card.setAttribute(
          'simulation-included',
          this._isSimulationIncluded({ kind: 'budget', id: b.id }) ? '' : 'false',
        );
        budgetGroup.appendChild(card);
      }
      budgetsContainer.appendChild(budgetGroup);

      if (openApiMonths.has(apiMonth)) {
        details.open = true;
      }
      sectionsEl.appendChild(details);
    }
  }
}

customElements.define(BuddjScreenAnnualOutflows.tagName, BuddjScreenAnnualOutflows);
