/**
 * Écran sorties annuelles : totaux sticky, recap des summary-row, mutations via store (comme après API).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import { createYearlyOutflowsServiceFromInMemory } from '../../src/adapters/yearly-outflows-service-from-in-memory.js';
import { createLoadYearlyOutflows } from '../../src/application/yearly-outflows/load-yearly-outflows.js';
import { createAddYearlySaving } from '../../src/application/yearly-outflows/add-yearly-saving.js';
import { createRemoveYearlySaving } from '../../src/application/yearly-outflows/remove-yearly-saving.js';
import { createUpdateYearlySaving } from '../../src/application/yearly-outflows/update-yearly-saving.js';
import { YearlyOutflowsStore } from '../../src/application/yearly-outflows/yearly-outflows-store.js';
import {
  createEmptyYearlyOutflowsView,
  type YearlyOutflowsView,
} from '../../src/application/yearly-outflows/yearly-outflows-view.js';
import { yearlyAveragePerMonthEuros } from '../../src/application/yearly-outflows/yearly-totals.js';
import { parseEurosToNumber } from '../../src/shared/goal.js';
import '../../src/register-components.js';
import { clickLineMenuAction, fillLineDrawer } from '../helpers/line-menu.js';
import {
  ANNUAL_OUTFLOWS_MONTH_LABELS_FR,
  BuddjScreenAnnualOutflows,
} from '../../src/components/screens/buddj-screen-annual-outflows.js';

function waitStoreEvent(store: YearlyOutflowsStore, name: string): Promise<void> {
  return new Promise((resolve) => {
    store.addEventListener(name, () => resolve(), { once: true });
  });
}

function seedView(): YearlyOutflowsView {
  const v = createEmptyYearlyOutflowsView();
  v.months[0]!.outflows.push({
    id: 'seed-out-1',
    month: 1,
    label: '🐕 Croquettes',
    amount: 120,
  });
  return v;
}

function createStoreFromSeedFixed() {
  const yearlyOutflowsService = createYearlyOutflowsServiceFromInMemory({
    initial: seedView(),
    delayMs: 0,
  });
  return new YearlyOutflowsStore({
    loadYearlyOutflows: createLoadYearlyOutflows({ yearlyOutflowsService }),
    addYearlySaving: createAddYearlySaving({ yearlyOutflowsService }),
    removeYearlySaving: createRemoveYearlySaving({ yearlyOutflowsService }),
    updateYearlySaving: createUpdateYearlySaving({ yearlyOutflowsService }),
  });
}

function readStickyTotalEuros(): number {
  const el = document.querySelector('[data-annual-total-per-month]');
  expect(el).toBeTruthy();
  return parseEurosToNumber(el!.textContent ?? '');
}

function recapLines(apiMonth: number): { charges: string; budgets: string } {
  const mois = ANNUAL_OUTFLOWS_MONTH_LABELS_FR[apiMonth - 1]!;
  return {
    charges: screen.getByRole('status', { name: `Récapitulatif des charges pour ${mois}` }).textContent?.trim() ?? '',
    budgets: screen.getByRole('status', { name: `Récapitulatif des budgets pour ${mois}` }).textContent?.trim() ?? '',
  };
}

describe('écran sorties annuelles (store + DOM)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <buddj-toast></buddj-toast>
      <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
      <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
      <buddj-emoji-picker-drawer id="emoji-picker-drawer"></buddj-emoji-picker-drawer>
      <buddj-charge-add-drawer id="charge-add-drawer"></buddj-charge-add-drawer>
      <buddj-budget-add-drawer id="budget-add-drawer"></buddj-budget-add-drawer>
      <div id="host"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('affiche total par mois et recap cohérents avec les données chargées', async () => {
    const store = createStoreFromSeedFixed();
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenAnnualOutflows.tagName) as InstanceType<typeof BuddjScreenAnnualOutflows>;
    el.init({ yearlyOutflowsStore: store });
    host.appendChild(el);

    await waitFor(() => {
      expect(document.querySelector('details[data-api-month="1"]')).toBeTruthy();
    });

    const view = store.getState().view;
    expect(readStickyTotalEuros()).toBeCloseTo(yearlyAveragePerMonthEuros({ view }), 5);

    const r = recapLines(1);
    expect(r.charges).toContain('1 charge');
    expect(r.charges).toContain('120');
    expect(r.budgets).toContain('0 budget');

    const chargeItem = document.querySelector('buddj-charge-item[outflow-id="seed-out-1"]');
    expect(chargeItem?.getAttribute('icon')).toBe('🐕');
    expect(chargeItem?.getAttribute('label')).toBe('Croquettes');
  });

  it('met à jour le total par mois et les recap après ajout charge et budget', async () => {
    const store = createStoreFromSeedFixed();
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenAnnualOutflows.tagName) as InstanceType<typeof BuddjScreenAnnualOutflows>;
    el.init({ yearlyOutflowsStore: store });
    host.appendChild(el);

    await waitFor(() => {
      expect(document.querySelector('details[data-api-month="1"]')).toBeTruthy();
    });

    const before = readStickyTotalEuros();

    store.emitAction('addYearlySaving', { kind: 'outflow', month: 1, label: 'Extra', amount: 60 });
    await waitStoreEvent(store, 'yearlySavingAddLoaded');

    await waitFor(() => {
      expect(recapLines(1).charges).toContain('2 charges');
    });
    expect(readStickyTotalEuros()).toBeGreaterThan(before);

    store.emitAction('addYearlySaving', { kind: 'budget', month: 1, label: 'Vacances', amount: 300 });
    await waitStoreEvent(store, 'yearlySavingAddLoaded');

    await waitFor(() => {
      const rb = recapLines(1).budgets;
      expect(rb).toContain('1 budget');
      expect(rb).toContain('300');
    });

    const expectedAvg = yearlyAveragePerMonthEuros({ view: store.getState().view });
    expect(readStickyTotalEuros()).toBeCloseTo(expectedAvg, 5);
  });

  it('met à jour recap et total après suppression', async () => {
    const store = createStoreFromSeedFixed();
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenAnnualOutflows.tagName) as InstanceType<typeof BuddjScreenAnnualOutflows>;
    el.init({ yearlyOutflowsStore: store });
    host.appendChild(el);

    await waitFor(() => {
      expect(document.querySelector('buddj-charge-item[outflow-id="seed-out-1"]')).toBeTruthy();
    });

    const item = document.querySelector('buddj-charge-item[outflow-id="seed-out-1"]')!;
    clickLineMenuAction(item, 'delete');
    await waitFor(() => {
      expect(screen.getByText(/Voulez-vous vraiment supprimer la charge/)).toBeTruthy();
    });
    const confirmBtn = screen.getByRole('button', { name: /Confirmer/i });
    fireEvent.click(confirmBtn);

    await waitStoreEvent(store, 'yearlySavingRemoveLoaded');
    await waitFor(() => {
      expect(recapLines(1).charges).toContain('0 charge');
    });
    expect(readStickyTotalEuros()).toBe(0);
  });

  it('conserve les mois dépliés après une mutation (ajout)', async () => {
    const store = createStoreFromSeedFixed();
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenAnnualOutflows.tagName) as InstanceType<typeof BuddjScreenAnnualOutflows>;
    el.init({ yearlyOutflowsStore: store });
    host.appendChild(el);

    await waitFor(() => {
      expect(document.querySelector('details[data-api-month="2"]')).toBeTruthy();
    });

    const feb = document.querySelector('details[data-api-month="2"]') as HTMLDetailsElement;
    feb.open = true;

    store.emitAction('addYearlySaving', { kind: 'outflow', month: 1, label: 'Nouvelle', amount: 5 });
    await waitStoreEvent(store, 'yearlySavingAddLoaded');

    await waitFor(() => {
      expect(document.querySelectorAll('buddj-charge-item[outflow-id]').length).toBeGreaterThanOrEqual(2);
    });

    const febAfter = document.querySelector('details[data-api-month="2"]') as HTMLDetailsElement;
    expect(febAfter.open).toBe(true);
    const jan = document.querySelector('details[data-api-month="1"]') as HTMLDetailsElement;
    expect(jan.open).toBe(false);
  });

  it('modifie une charge et un budget annuels via le menu ⋮, en gardant leur mois', async () => {
    const store = createStoreFromSeedFixed();
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenAnnualOutflows.tagName) as InstanceType<typeof BuddjScreenAnnualOutflows>;
    el.init({ yearlyOutflowsStore: store });
    host.appendChild(el);
    store.emitAction('addYearlySaving', { kind: 'budget', month: 1, label: '🏖️ Vacances', amount: 300 });
    await waitStoreEvent(store, 'yearlySavingAddLoaded');
    await waitFor(() => {
      expect(document.querySelector('buddj-template-budget-card')).toBeTruthy();
    });

    clickLineMenuAction(document.querySelector('buddj-charge-item[outflow-id="seed-out-1"]')!, 'edit');
    const chargeDrawer = document.getElementById('charge-add-drawer')!;
    await waitFor(() => {
      expect(chargeDrawer.classList.contains('charge-add-drawer--open')).toBe(true);
    });
    expect((chargeDrawer.querySelector('[data-charge-add-label]') as HTMLInputElement).value).toBe('Croquettes');
    await fillLineDrawer({ drawer: chargeDrawer, prefix: 'charge', label: 'Croquettes bio', amountDigits: ['1', '5', '0'], waitFor });
    await waitStoreEvent(store, 'yearlySavingUpdateLoaded');

    const jan = store.getState().view.months[0]!;
    expect(jan.outflows).toEqual([{ id: 'seed-out-1', month: 1, label: '🐕 Croquettes bio', amount: 150 }]);

    clickLineMenuAction(document.querySelector('buddj-template-budget-card')!, 'edit');
    const budgetDrawer = document.getElementById('budget-add-drawer')!;
    await waitFor(() => {
      expect(budgetDrawer.classList.contains('budget-add-drawer--open')).toBe(true);
    });
    await fillLineDrawer({ drawer: budgetDrawer, prefix: 'budget', label: 'Vacances été', amountDigits: ['4', '0', '0'], waitFor });
    await waitStoreEvent(store, 'yearlySavingUpdateLoaded');

    const budget = store.getState().view.months[0]!.budgets[0]!;
    expect(budget).toMatchObject({ month: 1, name: '🏖️ Vacances été', initialBalance: 400 });
    await waitFor(() => {
      expect(recapLines(1).budgets).toContain('400');
    });
  });
});
