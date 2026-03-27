import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { mapApiMonthPayloadToView, type ApiMonthPayload } from '../../src/adapters/map-api-month-to-view.js';
import { LOADING_CREATE_OUTFLOW_TEXT } from '../../src/application/month/month-store.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-charge-search-drawer id="charge-search-drawer"></buddj-charge-search-drawer>
    <buddj-charge-add-drawer id="charge-add-drawer"></buddj-charge-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

describe('ajout charge récurrente -> POST outflows', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('envoie emoji+label, puis affiche icon/label/montant cohérents', async () => {
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
        outflows: [{ id: 'o-1', amount: 45, label: '🚋 TAN', isChecked: false, pendingFrom: null }],
        weeklyBudgets: [],
      },
    };
    const month = mapApiMonthPayloadToView(dto);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [month], createOutflowDelayMs: 120 }),
    });
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

    const drawer = document.getElementById('charge-add-drawer')!;
    drawer.dispatchEvent(
      new CustomEvent('buddj-charge-add-done', {
        bubbles: true,
        detail: { label: 'Toto', amount: '12,00 €', emoji: '❤️' },
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_CREATE_OUTFLOW_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_CREATE_OUTFLOW_TEXT })).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'La charge a bien été ajoutée' })).toBeTruthy();
    });

    const allChargeItems = Array.from(document.getElementsByTagName('buddj-charge-item'));
    expect(allChargeItems).toHaveLength(2);
    const created = allChargeItems.find((el) => el.getAttribute('label') === 'Toto');
    expect(created).toBeTruthy();
    expect(created?.getAttribute('icon')).toBe('❤️');
    expect(created?.getAttribute('amount')).toBe('12');
  });
});
