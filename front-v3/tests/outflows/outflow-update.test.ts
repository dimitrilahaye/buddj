import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { mapApiMonthPayloadToView, type ApiMonthPayload } from '../../src/adapters/map-api-month-to-view.js';
import { LOADING_UPDATE_OUTFLOW_TEXT } from '../../src/application/month/month-store.js';
import type { MonthService } from '../../src/application/month/month-service.js';
import { formatEuros } from '../../src/shared/goal.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';
import { clickLineMenuAction, fillLineDrawer } from '../helpers/line-menu.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-month-search-drawer id="month-search-drawer"></buddj-month-search-drawer>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
    <buddj-emoji-picker-drawer id="emoji-picker-drawer"></buddj-emoji-picker-drawer>
    <buddj-charge-add-drawer id="charge-add-drawer"></buddj-charge-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

describe('modification charge récurrente → PATCH (in-memory)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('menu ⋮ → Modifier : drawer pré-rempli, envoi libellé API + montant, ligne et solde prévisionnel mis à jour', async () => {
    shellDocument();
    const dto: ApiMonthPayload = {
      id: '52bd55a5-9fb6-4f49-a56e-9a965985cf2e',
      date: '2026-03-01T00:00:00.000Z',
      dashboard: {
        account: { currentBalance: 4000, forecastBalance: 150.3 },
        weeks: { weeklyBudgets: [] },
      },
      account: {
        id: 'a66640a1-ab8e-472e-bdf9-5ba8207a8f2b',
        currentBalance: 4000,
        outflows: [{ id: 'o-1', amount: 100, label: '🏠 Loyer', isChecked: false, pendingFrom: null }],
        weeklyBudgets: [],
      },
    };
    const month = mapApiMonthPayloadToView(dto);
    const service = createMonthServiceFromInMemory({ months: [month], updateLineDelayMs: 120 });
    const calls: Parameters<MonthService['updateOutflow']>[0][] = [];
    const spied: MonthService = {
      ...service,
      updateOutflow: (input) => {
        calls.push(input);
        return service.updateOutflow(input);
      },
    };
    bootstrap({ authService: createAuthServiceFromInMemory(true), monthService: spied });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    const goOutflows = document.createElement('a');
    goOutflows.setAttribute('href', `/outflows/${month.id}`);
    document.body.appendChild(goOutflows);
    fireEvent.click(goOutflows);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Charges récurrentes', level: 1 })).toBeTruthy();
    });

    clickLineMenuAction(document.querySelector('buddj-charge-item[outflow-id="o-1"]')!, 'edit');
    const drawer = document.getElementById('charge-add-drawer')!;
    await waitFor(() => {
      expect(drawer.classList.contains('charge-add-drawer--open')).toBe(true);
    });
    expect(within(drawer).getByRole('heading', { name: 'Modifier la charge' })).toBeTruthy();
    expect((drawer.querySelector('[data-charge-add-label]') as HTMLInputElement).value).toBe('Loyer');
    expect(drawer.querySelector('[data-charge-add-amount]')!.textContent).toBe(formatEuros(100));

    await fillLineDrawer({ drawer, prefix: 'charge', label: 'Loyer T3', amountDigits: ['1', '2', '0'], waitFor });

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_UPDATE_OUTFLOW_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'La charge a bien été modifiée' })).toBeTruthy();
    });

    expect(calls).toEqual([{ monthId: month.id, outflowId: 'o-1', label: '🏠 Loyer T3', amount: 120 }]);
    const item = document.querySelector('buddj-charge-item[outflow-id="o-1"]')!;
    expect(item.getAttribute('label')).toBe('Loyer T3');
    expect(item.getAttribute('amount')).toBe('120');
    expect(within(screen.getByRole('complementary', { name: 'Résumé du mois' })).getByText(formatEuros(130.3))).toBeTruthy();
  });
});
