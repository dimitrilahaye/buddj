import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { LOADING_CURRENT_BALANCE_UPDATE_TEXT } from '../../src/application/month/month-store.js';
import { formatEuros } from '../../src/shared/goal.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

function recap(): HTMLElement {
  return screen.getByRole('complementary', { name: 'Résumé du mois' });
}

describe('modification du solde actuel', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('appelle PUT checking avec loading + toast + update vue', async () => {
    shellDocument();
    const months: MonthView[] = [
      {
        id: '52bd55a5-9fb6-4f49-a56e-9a965985cf2e',
        accountId: 'a66640a1-ab8e-472e-bdf9-5ba8207a8f2b',
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 4000,
        projectedBalance: 150.3,
        budgetGroups: [],
        chargeGroups: [],
        outflows: [],
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, putOutflowsDelayMs: 120 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    expect(within(recap()).getByText(formatEuros(4000))).toBeTruthy();

    fireEvent.click(within(recap()).getByRole('button', { name: formatEuros(4000) }));
    let calc: HTMLElement;
    await waitFor(() => {
      calc = screen.getByRole('dialog', { name: 'Solde actuel' }) as HTMLElement;
      expect(calc).toBeTruthy();
    });
    calc = screen.getByRole('dialog', { name: 'Solde actuel' }) as HTMLElement;
    fireEvent.click(within(calc).getByRole('button', { name: 'Effacer' }));
    for (const digit of ['3', '5', '0', '0'] as const) {
      fireEvent.click(within(calc).getByRole('button', { name: digit }));
    }
    fireEvent.click(within(calc).getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_CURRENT_BALANCE_UPDATE_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_CURRENT_BALANCE_UPDATE_TEXT })).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Le solde a bien été enregistré' })).toBeTruthy();
    });
    expect(within(recap()).getByText(formatEuros(3500))).toBeTruthy();
  });
});
