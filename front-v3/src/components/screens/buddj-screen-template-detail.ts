/**
 * Écran Détail d’un template : TemplatesStore + renommage, défaut, charges / budgets (API).
 */
import type { TemplatesStore } from '../../application/template/templates-store.js';
import type { TemplateOutflowView, TemplateView } from '../../application/template/template-view.js';
import type { ChargeItemData } from '../../application/month/month-types.js';
import { getToast } from '../atoms/buddj-toast.js';
import { formatEuros, parseEurosToNumber } from '../../shared/goal.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { splitLeadingEmoji } from '../../shared/emoji-label.js';
import { entryMatchesSearch } from '../../shared/search.js';
import {
  isProjectedSimulationActive,
  projectedSimulationKey,
  PROJECTED_SIMULATION_RESET_ICON_SVG,
  type ProjectedSimulationKind,
} from '../../shared/projected-simulation.js';

const DEFAULT_TEMPLATE_EMOJI = '📆';

type BudgetEditDrawerElement = HTMLElement & {
  open: (o: {
    initialLabel: string;
    initialEmoji?: string;
    title?: string;
    ariaLabel?: string;
    onValidate: (label: string, emoji: string) => void;
  }) => void;
};

export class BuddjScreenTemplateDetail extends HTMLElement {
  static readonly tagName = 'buddj-screen-template-detail';

  private _store?: TemplatesStore;
  private _templateId = '';
  /** Conservé entre re-renders (ex. après suppression d’un budget) pour ne pas revenir sur Charges. */
  private _activeDetailTab: 'charges' | 'budgets' = 'charges';
  /** Simulation locale : inclusion des lignes dans le total affiché (non persistée). */
  private _simulationIncluded = new Map<string, boolean>();
  /** Vrai dès la première inclusion/exclusion manuelle, jusqu’au clic sur Terminer la simulation. */
  private _projectedSimulationSession = false;
  private _simulationListenersAttached = false;
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

  init({ templatesStore, templateId }: { templatesStore: TemplatesStore; templateId: string }): void {
    this._store = templatesStore;
    this._templateId = templateId.trim();
  }

  connectedCallback(): void {
    if (this.querySelector('#template-detail')) return;
    const store = this._store;
    if (!store || !this._templateId) return;

    store.addEventListener('templatesStateUpdated', this._onStore);
    store.addEventListener('templateUpdateFailed', this._onMutationError);
    store.addEventListener('templateOutflowAddFailed', this._onMutationError);
    store.addEventListener('templateOutflowDeleteFailed', this._onMutationError);
    store.addEventListener('templateBudgetAddFailed', this._onMutationError);
    store.addEventListener('templateBudgetDeleteFailed', this._onMutationError);
    store.addEventListener('templateOutflowAddLoaded', this._onSuccessToast);
    store.addEventListener('templateOutflowDeleteLoaded', this._onSuccessToast);
    store.addEventListener('templateBudgetAddLoaded', this._onSuccessToast);
    store.addEventListener('templateBudgetDeleteLoaded', this._onSuccessToast);

    document.addEventListener('buddj-charge-add-done', this._onChargeAddDone);
    document.addEventListener('buddj-budget-create-submit', this._onBudgetCreateSubmit);
    document.addEventListener('buddj-charge-search', this._chargeSearchListener);
    document.addEventListener('buddj-expense-search', this._expenseSearchListener);

    if (store.getState().templates.length === 0) {
      store.emitAction('loadTemplates');
    }
    this._render();
    this.attachListeners();
  }

  disconnectedCallback(): void {
    this._store?.removeEventListener('templatesStateUpdated', this._onStore);
    this._store?.removeEventListener('templateUpdateFailed', this._onMutationError);
    this._store?.removeEventListener('templateOutflowAddFailed', this._onMutationError);
    this._store?.removeEventListener('templateOutflowDeleteFailed', this._onMutationError);
    this._store?.removeEventListener('templateBudgetAddFailed', this._onMutationError);
    this._store?.removeEventListener('templateBudgetDeleteFailed', this._onMutationError);
    this._store?.removeEventListener('templateOutflowAddLoaded', this._onSuccessToast);
    this._store?.removeEventListener('templateOutflowDeleteLoaded', this._onSuccessToast);
    this._store?.removeEventListener('templateBudgetAddLoaded', this._onSuccessToast);
    this._store?.removeEventListener('templateBudgetDeleteLoaded', this._onSuccessToast);
    document.removeEventListener('buddj-charge-add-done', this._onChargeAddDone);
    document.removeEventListener('buddj-budget-create-submit', this._onBudgetCreateSubmit);
    document.removeEventListener('buddj-charge-search', this._chargeSearchListener);
    document.removeEventListener('buddj-expense-search', this._expenseSearchListener);
  }

  private _onMutationError = ((e: Event) => {
    const d = (e as CustomEvent<{ message?: string }>).detail;
    getToast()?.show({ message: d?.message ?? 'Une erreur est survenue', variant: 'error', durationMs: 3500 });
  }) as EventListener;

  private _onSuccessToast = ((e: Event) => {
    const d = (e as CustomEvent<{ templateId?: string }>).detail;
    if (d?.templateId !== this._templateId) return;
    const name = e.type;
    let msg = 'Mis à jour';
    if (name === 'templateOutflowAddLoaded') msg = 'Charge ajoutée';
    else if (name === 'templateOutflowDeleteLoaded') msg = 'Charge supprimée';
    else if (name === 'templateBudgetAddLoaded') msg = 'Budget ajouté';
    else if (name === 'templateBudgetDeleteLoaded') msg = 'Budget supprimé';
    getToast()?.show({ message: msg });
  }) as EventListener;

  private _onStore = (): void => {
    this._render();
  };

  private _onChargeAddDone = (e: Event): void => {
    const store = this._store;
    if (!store || !this._templateId || !this.isConnected) return;
    const d = (e as CustomEvent<{ label: string; amount: string; emoji: string }>).detail;
    if (!d?.label?.trim()) return;
    const apiLabel = `${d.emoji ?? '💰'} ${d.label}`.trim();
    const amount = parseEurosToNumber(d.amount);
    if (amount <= 0) return;
    store.emitAction('addTemplateOutflow', {
      templateId: this._templateId,
      label: apiLabel,
      amount,
    });
  };

  private _onBudgetCreateSubmit = (e: Event): void => {
    const store = this._store;
    if (!store || !this._templateId || !this.isConnected) return;
    const d = (e as CustomEvent<{ name: string; initialBalance: number }>).detail;
    if (!d?.name?.trim() || d.initialBalance === undefined || d.initialBalance <= 0) return;
    store.emitAction('addTemplateBudget', {
      templateId: this._templateId,
      name: d.name,
      initialBalance: d.initialBalance,
    });
  };

  private _currentTemplate(): TemplateView | undefined {
    return this._store?.getTemplateById(this._templateId);
  }

  private _outflowToChargeItem(o: TemplateOutflowView): ChargeItemData {
    const parsed = splitLeadingEmoji({ label: o.label, defaultIcon: '💰' });
    return { icon: parsed.icon, label: parsed.text || o.label, amount: o.amount };
  }

  private _render(): void {
    const store = this._store;
    if (!store) return;
    const template = this._currentTemplate();
    const { isLoading, loadErrorMessage } = store.getState();

    if (isLoading && !template) {
      this.innerHTML =
        '<main id="template-detail" class="screen screen--template-detail"><p class="templates-loading">Chargement…</p></main>';
      return;
    }
    if (!template && loadErrorMessage) {
      this.innerHTML = `<main id="template-detail" class="screen screen--template-detail"><p class="templates-error" role="alert">${escapeHtml(loadErrorMessage)}</p></main>`;
      return;
    }
    if (!template) {
      this.innerHTML = `
      <main id="template-detail" class="screen screen--template-detail">
        <div class="screen-sticky-header-wrap template-detail-sticky-wrap">
          <header class="new-month-header template-detail-header">
            <div class="template-detail-header-row template-detail-header-row--back-only">
              <a href="/templates" class="template-detail-back" aria-label="Retour aux templates">←</a>
            </div>
          </header>
        </div>
        <div class="template-detail-not-found" role="alert">
          <p class="template-detail-not-found-message">Template introuvable.</p>
        </div>
      </main>`;
      return;
    }

    this._syncSimulationKeysFromTemplate({ template });
    const chargesTotal = template.outflows.reduce((s, o) => s + o.amount, 0);
    const budgetsTotal = template.budgets.reduce((s, b) => s + b.initialBalance, 0);
    const total = this._getSimulatedTotal({ template });
    const simulating = this._isProjectedSimulationUiActive();
    const busy = store.getState().busyTemplateId === this._templateId;
    const tabCharges = this._activeDetailTab === 'charges';
    const tabBudgets = this._activeDetailTab === 'budgets';

    const main = document.createElement('main');
    main.id = 'template-detail';
    main.className = 'screen screen--template-detail';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap template-detail-sticky-wrap">
        <header class="new-month-header template-detail-header">
          <div class="template-detail-header-row">
            <a href="/templates" class="template-detail-back" aria-label="Retour aux templates">←</a>
            <div class="template-detail-title-block">
              <h1 class="new-month-title">
                <button type="button" class="template-detail-title-edit" aria-label="Renommer le template">
                  <buddj-text-ellipsis text="${escapeAttr(template.name)}"></buddj-text-ellipsis>
                </button>
              </h1>
            </div>
            <label class="template-default-switch-wrap">
              <span class="template-default-switch-label">Par défaut</span>
              <span class="template-default-switch-row">
                <input type="checkbox" class="template-default-switch" role="switch" data-default-toggle aria-label="Template par défaut" ${template.isDefault ? 'checked' : ''} ${busy ? 'disabled' : ''}>
              </span>
            </label>
          </div>
        </header>
        <div class="new-month-projected-sticky${simulating ? ' new-month-projected-sticky--simulating' : ''}" aria-live="polite">
          <span class="new-month-projected-label">Total charges et budgets</span>
          <div class="new-month-projected-sticky-end">
            <span class="new-month-projected${simulating ? ' new-month-projected--simulating' : ''}" data-new-month-projected>${escapeHtml(formatEuros(total))}</span>
            <button type="button" class="btn projected-simulation-end" data-end-projected-simulation ${simulating ? '' : 'hidden'} aria-label="Terminer la simulation" title="Terminer la simulation">${PROJECTED_SIMULATION_RESET_ICON_SVG}</button>
          </div>
        </div>
        <div class="template-detail-tabs" role="tablist" aria-label="Charges ou budgets">
          <button type="button" class="template-detail-tab${tabCharges ? ' template-detail-tab--active' : ''}" role="tab" data-tab="charges" aria-selected="${tabCharges ? 'true' : 'false'}">Charges</button>
          <button type="button" class="template-detail-tab${tabBudgets ? ' template-detail-tab--active' : ''}" role="tab" data-tab="budgets" aria-selected="${tabBudgets ? 'true' : 'false'}">Budgets</button>
        </div>
      </div>
      <section class="template-detail-sections">
        <div class="template-detail-panel${tabCharges ? '' : ' template-detail-panel--hidden'}" data-panel="charges" role="tabpanel"${tabCharges ? '' : ' hidden'}>
          <div class="template-section-content" data-charges-container></div>
        </div>
        <div class="template-detail-panel${tabBudgets ? '' : ' template-detail-panel--hidden'}" data-panel="budgets" role="tabpanel"${tabBudgets ? '' : ' hidden'}>
          <div class="template-section-content" data-budgets-container></div>
        </div>
      </section>
    `;

    const chargesContainer = main.querySelector('[data-charges-container]')!;
    const chargeGroup = document.createElement('buddj-charge-group');
    chargeGroup.setAttribute('section-title', 'Charges récurrentes mensuelles');
    chargeGroup.setAttribute('show-add', '');
    chargeGroup.setAttribute('show-search', '');
    chargeGroup.setAttribute('add-label', 'Ajouter une charge');
    chargeGroup.setAttribute('add-title', 'Ajouter une charge récurrente');
    chargeGroup.setAttribute('recap-count', String(template.outflows.length));
    chargeGroup.setAttribute('recap-total', formatEuros(chargesTotal));
    chargeGroup.setAttribute('add-align', 'right');
    for (const o of template.outflows) {
      const c = this._outflowToChargeItem(o);
      const item = document.createElement('buddj-charge-item');
      item.setAttribute('outflow-id', o.id);
      item.setAttribute('icon', c.icon);
      item.setAttribute('label', c.label);
      item.setAttribute('amount', String(c.amount));
      item.setAttribute('projected-simulation', '');
      item.setAttribute(
        'simulation-included',
        this._isSimulationIncluded({ kind: 'charge', id: o.id }) ? '' : 'false',
      );
      chargeGroup.appendChild(item);
    }
    chargesContainer.appendChild(chargeGroup);

    const budgetsContainer = main.querySelector('[data-budgets-container]')!;
    const budgetGroup = document.createElement('buddj-budget-group');
    budgetGroup.setAttribute('section-title', 'Budgets mensuels');
    budgetGroup.setAttribute('show-add', '');
    budgetGroup.setAttribute('show-search', '');
    budgetGroup.setAttribute('recap-count', String(template.budgets.length));
    budgetGroup.setAttribute('recap-total', formatEuros(budgetsTotal));
    budgetGroup.setAttribute('add-align', 'right');
    budgetGroup.setAttribute('template-mode', '');
    for (const b of template.budgets) {
      const parsed = splitLeadingEmoji({ label: b.name, defaultIcon: '💰' });
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

    this.innerHTML = '';
    this.appendChild(main);
    this._attachSimulationListeners();
  }

  private _syncSimulationKeysFromTemplate({ template }: { template: TemplateView }): void {
    const validKeys = new Set<string>();
    for (const o of template.outflows) {
      const key = projectedSimulationKey({ kind: 'charge', id: o.id });
      validKeys.add(key);
      if (!this._simulationIncluded.has(key)) this._simulationIncluded.set(key, true);
    }
    for (const b of template.budgets) {
      const key = projectedSimulationKey({ kind: 'budget', id: b.id });
      validKeys.add(key);
      if (!this._simulationIncluded.has(key)) this._simulationIncluded.set(key, true);
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

  private _getSimulatedTotal({ template }: { template: TemplateView }): number {
    let sum = 0;
    for (const o of template.outflows) {
      if (this._isSimulationIncluded({ kind: 'charge', id: o.id })) sum += o.amount;
    }
    for (const b of template.budgets) {
      if (this._isSimulationIncluded({ kind: 'budget', id: b.id })) sum += b.initialBalance;
    }
    return sum;
  }

  private _updateProjectedSimulationUi(): void {
    const template = this._currentTemplate();
    if (!template) return;
    const simulating = this._isProjectedSimulationUiActive();
    const total = this._getSimulatedTotal({ template });
    const sticky = this.querySelector('.new-month-projected-sticky');
    sticky?.classList.toggle('new-month-projected-sticky--simulating', simulating);
    const projected = this.querySelector('[data-new-month-projected]');
    projected?.classList.toggle('new-month-projected--simulating', simulating);
    if (projected) projected.textContent = formatEuros(total);
    const endBtn = this.querySelector('[data-end-projected-simulation]');
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
    this.addEventListener('buddj-charge-delete-confirmed', (e) => {
      const d = (e as CustomEvent<{ outflowId: string }>).detail;
      if (!d?.outflowId || !this._store || !this._templateId) return;
      this._store.emitAction('deleteTemplateOutflow', {
        templateId: this._templateId,
        outflowId: d.outflowId,
      });
    });

    this.addEventListener('buddj-template-budget-delete-confirmed', (e) => {
      const d = (e as CustomEvent<{ budgetId: string }>).detail;
      if (!d?.budgetId || !this._store || !this._templateId) return;
      this._store.emitAction('deleteTemplateBudget', {
        templateId: this._templateId,
        budgetId: d.budgetId,
      });
    });

    this.addEventListener('click', (e) => {
      const target = e.target as Element;
      const titleEdit = target.closest('.template-detail-title-edit');
      if (titleEdit && this._store && this._templateId) {
        e.preventDefault();
        const t = this._currentTemplate();
        if (!t) return;
        const parsed = splitLeadingEmoji({ label: t.name, defaultIcon: DEFAULT_TEMPLATE_EMOJI });
        const drawer = document.getElementById('budget-edit-drawer') as BudgetEditDrawerElement | null;
        drawer?.open({
          initialLabel: parsed.text || t.name,
          initialEmoji: parsed.icon,
          title: 'Modifier le template',
          ariaLabel: 'Modifier le template',
          onValidate: (label, emoji) => {
            const apiName = `${emoji} ${label}`.trim();
            this._store!.emitAction('updateTemplate', {
              templateId: this._templateId,
              name: apiName,
              isDefault: t.isDefault,
            });
            getToast()?.show({ message: 'Template renommé' });
          },
        });
        return;
      }
      const tab = target.closest('.template-detail-tab[data-tab]');
      if (tab) {
        e.preventDefault();
        const tabId = tab.getAttribute('data-tab');
        if (!tabId) return;
        if (tabId === 'charges' || tabId === 'budgets') {
          this._activeDetailTab = tabId;
        }
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

    this.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target.getAttribute('data-default-toggle') !== null && target.getAttribute('role') === 'switch') {
        if (!this._store || !this._templateId) return;
        const t = this._currentTemplate();
        if (!t) return;
        const isDefault = (target as HTMLInputElement).checked;
        this._store.emitAction('updateTemplate', {
          templateId: this._templateId,
          name: t.name,
          isDefault,
        });
        getToast()?.show({ message: 'Template mis à jour' });
      }
    });
  }
}

customElements.define(BuddjScreenTemplateDetail.tagName, BuddjScreenTemplateDetail);
