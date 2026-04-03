import { describe, it, expect } from 'vitest';
import { createYearlyOutflowsServiceFromInMemory } from '../../src/adapters/yearly-outflows-service-from-in-memory.js';
import { createLoadYearlyOutflows } from '../../src/application/yearly-outflows/load-yearly-outflows.js';
import { createAddYearlySaving } from '../../src/application/yearly-outflows/add-yearly-saving.js';
import { createRemoveYearlySaving } from '../../src/application/yearly-outflows/remove-yearly-saving.js';
import { YearlyOutflowsStore } from '../../src/application/yearly-outflows/yearly-outflows-store.js';
import { createEmptyYearlyOutflowsView } from '../../src/application/yearly-outflows/yearly-outflows-view.js';
import { yearlyAveragePerMonthEuros } from '../../src/application/yearly-outflows/yearly-totals.js';

function waitStoreEvent(store: YearlyOutflowsStore, name: string): Promise<void> {
  return new Promise((resolve) => {
    store.addEventListener(name, () => resolve(), { once: true });
  });
}

function createStore() {
  const yearlyOutflowsService = createYearlyOutflowsServiceFromInMemory({
    initial: createEmptyYearlyOutflowsView(),
    delayMs: 0,
  });
  return new YearlyOutflowsStore({
    loadYearlyOutflows: createLoadYearlyOutflows({ yearlyOutflowsService }),
    addYearlySaving: createAddYearlySaving({ yearlyOutflowsService }),
    removeYearlySaving: createRemoveYearlySaving({ yearlyOutflowsService }),
  });
}

describe('YearlyOutflowsStore', () => {
  it('charge les sorties annuelles', async () => {
    const store = createStore();
    const done = waitStoreEvent(store, 'yearlyOutflowsLoaded');
    store.emitAction('loadYearlyOutflows');
    await done;
    expect(store.getState().loadErrorMessage).toBeNull();
    expect(store.getState().view.months).toHaveLength(12);
  });

  it('ajoute une charge puis supprime et met à jour la vue', async () => {
    const store = createStore();
    store.emitAction('loadYearlyOutflows');
    await waitStoreEvent(store, 'yearlyOutflowsLoaded');

    const addDone = waitStoreEvent(store, 'yearlySavingAddLoaded');
    store.emitAction('addYearlySaving', {
      kind: 'outflow',
      month: 3,
      label: 'Test charge',
      amount: 45,
    });
    await addDone;

    const m2 = store.getState().view.months[2]!;
    expect(m2.outflows).toHaveLength(1);
    expect(m2.outflows[0]?.label).toBe('Test charge');
    expect(m2.outflows[0]?.amount).toBe(45);

    const id = m2.outflows[0]!.id;
    const remDone = waitStoreEvent(store, 'yearlySavingRemoveLoaded');
    store.emitAction('removeYearlySaving', { id });
    await remDone;
    expect(store.getState().view.months[2]!.outflows).toHaveLength(0);
  });

  it('ajoute un budget', async () => {
    const store = createStore();
    store.emitAction('loadYearlyOutflows');
    await waitStoreEvent(store, 'yearlyOutflowsLoaded');

    store.emitAction('addYearlySaving', {
      kind: 'budget',
      month: 12,
      label: 'Noël',
      amount: 200,
    });
    await waitStoreEvent(store, 'yearlySavingAddLoaded');

    const nov = store.getState().view.months[11]!;
    expect(nov.budgets).toHaveLength(1);
    expect(nov.budgets[0]?.name).toBe('Noël');
    expect(nov.budgets[0]?.initialBalance).toBe(200);
  });

  it('ignore addYearlySaving invalide (pas d’appel API)', async () => {
    const store = createStore();
    store.emitAction('loadYearlyOutflows');
    await waitStoreEvent(store, 'yearlyOutflowsLoaded');

    let fired = false;
    store.addEventListener('yearlySavingAddLoaded', () => {
      fired = true;
    });
    store.emitAction('addYearlySaving', {
      kind: 'outflow',
      month: 1,
      label: '',
      amount: 10,
    });
    await new Promise((r) => setTimeout(r, 20));
    expect(fired).toBe(false);
  });

  it('cohérence moyenne mensuelle après add/remove', async () => {
    const store = createStore();
    store.emitAction('loadYearlyOutflows');
    await waitStoreEvent(store, 'yearlyOutflowsLoaded');

    expect(yearlyAveragePerMonthEuros({ view: store.getState().view })).toBe(0);

    store.emitAction('addYearlySaving', { kind: 'outflow', month: 1, label: 'A', amount: 120 });
    await waitStoreEvent(store, 'yearlySavingAddLoaded');
    expect(yearlyAveragePerMonthEuros({ view: store.getState().view })).toBe(10);

    const oid = store.getState().view.months[0]!.outflows[0]!.id;
    store.emitAction('removeYearlySaving', { id: oid });
    await waitStoreEvent(store, 'yearlySavingRemoveLoaded');
    expect(yearlyAveragePerMonthEuros({ view: store.getState().view })).toBe(0);
  });
});
