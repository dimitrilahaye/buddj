import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createYearlyOutflowsServiceFromInMemory } from '../../src/adapters/yearly-outflows-service-from-in-memory.js';
import { createLoadYearlyOutflows } from '../../src/application/yearly-outflows/load-yearly-outflows.js';
import { createAddYearlySaving } from '../../src/application/yearly-outflows/add-yearly-saving.js';
import { createRemoveYearlySaving } from '../../src/application/yearly-outflows/remove-yearly-saving.js';
import { YearlyOutflowsStore } from '../../src/application/yearly-outflows/yearly-outflows-store.js';
import {
  createEmptyYearlyOutflowsView,
  type YearlyOutflowsView,
} from '../../src/application/yearly-outflows/yearly-outflows-view.js';
import { yearlyAveragePerMonthEuros } from '../../src/application/yearly-outflows/yearly-totals.js';
import { formatEuros, parseEurosToNumber } from '../../src/shared/goal.js';
import '../../src/register-components.js';
import { BuddjScreenAnnualOutflows } from '../../src/components/screens/buddj-screen-annual-outflows.js';

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

function createStoreFromSeed() {
  const yearlyOutflowsService = createYearlyOutflowsServiceFromInMemory({
    initial: seedView(),
    delayMs: 0,
  });
  return new YearlyOutflowsStore({
    loadYearlyOutflows: createLoadYearlyOutflows({ yearlyOutflowsService }),
    addYearlySaving: createAddYearlySaving({ yearlyOutflowsService }),
    removeYearlySaving: createRemoveYearlySaving({ yearlyOutflowsService }),
  });
}

function annualOutflowsMain(): HTMLElement {
  const heading = screen.getByRole('heading', { name: 'Sorties annuelles', level: 1 });
  const main = heading.closest('main');
  expect(main).toBeTruthy();
  return main as HTMLElement;
}

function projectedAmount({ main, amount }: { main: HTMLElement; amount: string }): HTMLElement {
  return within(projectedSticky({ main })).getByText(amount);
}

function projectedSticky({ main }: { main: HTMLElement }): HTMLElement {
  const label = within(main).getByText('Total par mois');
  const sticky = label.parentElement;
  expect(sticky).toBeTruthy();
  return sticky as HTMLElement;
}

function readStickyTotalEuros({ main }: { main: HTMLElement }): number {
  const sticky = projectedSticky({ main });
  const amountMatch = sticky.textContent?.match(/([\d\s\u202f]+,\d{2})\s*€/);
  expect(amountMatch).toBeTruthy();
  return parseEurosToNumber(amountMatch![0] ?? '');
}

function expandJanuary({ main }: { main: HTMLElement }): void {
  const janvierSummary = within(main).getByText('Janvier');
  fireEvent.click(janvierSummary);
}

function projectedSimulationCheckbox({ main }: { main: HTMLElement }): HTMLInputElement {
  return within(main).getByRole('checkbox', {
    name: 'Exclure du total projeté',
  }) as HTMLInputElement;
}

function mountAnnualOutflowsScreen({ store }: { store: YearlyOutflowsStore }): HTMLElement {
  const screenEl = document.createElement(BuddjScreenAnnualOutflows.tagName) as BuddjScreenAnnualOutflows;
  screenEl.init({ yearlyOutflowsStore: store });
  document.getElementById('host')!.appendChild(screenEl);
  return screenEl;
}

describe('sorties annuelles — simulation inclusion (checkbox)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <buddj-toast></buddj-toast>
      <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
      <div id="host"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('met à jour le total par mois, la session de simulation et Terminer la simulation', async () => {
    const store = createStoreFromSeed();
    mountAnnualOutflowsScreen({ store });

    await waitStoreEvent(store, 'yearlyOutflowsStateUpdated');

    const main = annualOutflowsMain();
    expandJanuary({ main });
    const expectedAvg = yearlyAveragePerMonthEuros({ view: seedView() });
    expect(readStickyTotalEuros({ main })).toBeCloseTo(expectedAvg, 5);

    expect(projectedAmount({ main, amount: formatEuros(expectedAvg) }).textContent?.trim()).toBe(
      formatEuros(expectedAvg),
    );
    expect(screen.queryByRole('button', { name: 'Terminer la simulation' })).toBeNull();

    const chargeCb = projectedSimulationCheckbox({ main });
    expect(chargeCb.checked).toBe(false);
    chargeCb.checked = true;
    fireEvent.change(chargeCb);

    await waitFor(() => {
      expect(readStickyTotalEuros({ main })).toBeCloseTo(0, 5);
    });
    expect(projectedAmount({ main, amount: formatEuros(0) }).textContent?.trim()).toBe(formatEuros(0));
    expect(screen.getByRole('button', { name: 'Terminer la simulation' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Terminer la simulation' }));

    await waitFor(() => {
      expect(readStickyTotalEuros({ main })).toBeCloseTo(expectedAvg, 5);
    });
    expect(projectedAmount({ main, amount: formatEuros(expectedAvg) }).textContent?.trim()).toBe(
      formatEuros(expectedAvg),
    );
    expect(chargeCb.checked).toBe(false);
    expect(screen.queryByRole('button', { name: 'Terminer la simulation' })).toBeNull();
  });
});
