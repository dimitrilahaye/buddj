import { describe, expect, it } from 'vitest';
import { SpendingTrackerStore } from '../../src/application/spending-tracker/spending-tracker-store.js';
import { createLoadSpendingTracker } from '../../src/application/spending-tracker/load-spending-tracker.js';
import { createSpendingTrackerServiceFromInMemory } from '../../src/adapters/spending-tracker-service-from-in-memory.js';
import type { SpendingTrackerView } from '../../src/application/spending-tracker/spending-tracker-types.js';

function waitStoreEvent(store: SpendingTrackerStore, name: string): Promise<void> {
  return new Promise((resolve) => store.addEventListener(name, () => resolve(), { once: true }));
}

function emptyView(range: { from: string; to: string }): SpendingTrackerView {
  return { granularity: 'day', ...range, total: 0, expensesTotal: 0, outflowsTotal: 0, buckets: [] };
}

describe('store du suivi des dépenses', () => {
  it('déduit la granularité de la plage demandée', async () => {
    const service = createSpendingTrackerServiceFromInMemory();
    const store = new SpendingTrackerStore({ loadSpendingTracker: createLoadSpendingTracker({ spendingTrackerService: service }) });

    const loaded = waitStoreEvent(store, 'spendingTrackerLoaded');
    store.emitAction('loadSpendingTracker', { from: '2026-01-01', to: '2026-11-13', shortcut: null });
    await loaded;

    expect(service.calls).toEqual([{ granularity: 'month', from: '2026-01-01', to: '2026-11-13' }]);
    expect(store.getState()).toMatchObject({
      range: { from: '2026-01-01', to: '2026-11-13' },
      shortcut: null,
      isLoading: false,
    });
  });

  it('ignore une plage invalide', () => {
    const service = createSpendingTrackerServiceFromInMemory();
    const store = new SpendingTrackerStore({ loadSpendingTracker: createLoadSpendingTracker({ spendingTrackerService: service }) });

    store.emitAction('loadSpendingTracker', { from: '2026-11-13', to: '2026-11-01', shortcut: null });

    expect(service.calls).toEqual([]);
    expect(store.getState().range).toBeNull();
  });

  it('ne garde que la réponse de la dernière plage demandée', async () => {
    const resolvers: Array<(view: SpendingTrackerView) => void> = [];
    const store = new SpendingTrackerStore({
      loadSpendingTracker: () => new Promise((resolve) => resolvers.push(resolve)),
    });

    store.emitAction('loadSpendingTracker', { from: '2026-11-01', to: '2026-11-13', shortcut: 'month' });
    store.emitAction('loadSpendingTracker', { from: '2026-11-13', to: '2026-11-13', shortcut: 'today' });
    resolvers[1]!(emptyView({ from: '2026-11-13', to: '2026-11-13' }));
    await Promise.resolve();
    resolvers[0]!(emptyView({ from: '2026-11-01', to: '2026-11-13' }));
    await Promise.resolve();

    expect(store.getState().view?.from).toBe('2026-11-13');
    expect(store.getState().shortcut).toBe('today');
  });

  it('expose le message d’erreur quand le chargement échoue', async () => {
    const service = createSpendingTrackerServiceFromInMemory({ failWith: 'Serveur indisponible' });
    const store = new SpendingTrackerStore({ loadSpendingTracker: createLoadSpendingTracker({ spendingTrackerService: service }) });

    const failed = new Promise<string>((resolve) =>
      store.addEventListener('spendingTrackerLoadFailed', (e) => resolve((e as CustomEvent<{ message: string }>).detail.message), {
        once: true,
      })
    );
    store.emitAction('loadSpendingTracker', { from: '2026-11-13', to: '2026-11-13', shortcut: 'today' });

    expect(await failed).toBe('Serveur indisponible');
    expect(store.getState()).toMatchObject({ isLoading: false, loadErrorMessage: 'Serveur indisponible' });
  });

  it('refuse de décocher les deux types', () => {
    const store = new SpendingTrackerStore({ loadSpendingTracker: async (range) => emptyView(range) });

    store.emitAction('setSpendingKinds', { expense: false, outflow: true });
    store.emitAction('setSpendingKinds', { expense: false, outflow: false });

    expect(store.getState().kinds).toEqual({ expense: false, outflow: true });
  });
});
