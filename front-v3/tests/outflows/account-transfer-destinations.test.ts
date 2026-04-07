import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
    <buddj-transfer-drawer id="transfer-drawer"></buddj-transfer-drawer>
    <buddj-month-search-drawer id="month-search-drawer"></buddj-month-search-drawer>
    <buddj-charge-add-drawer id="charge-add-drawer"></buddj-charge-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

describe('transfert depuis solde sur page Charges', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('affiche les budgets de destination dans le drawer de transfert', async () => {
    shellDocument();
    const monthId = '52bd55a5-9fb6-4f49-a56e-9a965985cf2e';
    const accountId = 'a66640a1-ab8e-472e-bdf9-5ba8207a8f2b';
    const months: MonthView[] = [
      {
        id: monthId,
        accountId,
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 1000,
        projectedBalance: 250,
        budgetGroups: [
          {
            title: 'Budgets',
            showAdd: true,
            budgets: [
              {
                name: 'Semaine 1',
                icon: '💰',
                allocated: 200,
                weeklyBudgetId: '3157ec1f-2ecc-4789-af7c-3926b71f7933',
                expenses: [],
              },
              {
                name: 'Semaine 2',
                icon: '🎯',
                allocated: 300,
                weeklyBudgetId: 'ba460cbc-e812-4ee4-96c6-9d0f4e171ea2',
                expenses: [{ id: 'e1', icon: '🛒', desc: 'Courses', amount: 20, taken: false }],
              },
            ],
          },
        ],
        chargeGroups: [
          {
            title: 'Charges',
            showAdd: true,
            charges: [{ id: 'c1', icon: '🏠', label: 'Loyer', amount: 500, taken: false }],
          },
        ],
      },
    ];

    window.history.replaceState(null, '', `/outflows/${monthId}`);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Charges récurrentes', level: 1 })).toBeTruthy();
    });

    const recap = screen.getByRole('complementary', { name: 'Résumé du mois' });
    fireEvent.click(within(recap).getByRole('button', { name: 'Options du mois' }));
    await waitFor(() => {
      expect(within(recap).getByRole('button', { name: 'Transférer' })).toBeTruthy();
    });
    fireEvent.click(within(recap).getByRole('button', { name: 'Transférer' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Transférer' })).toBeTruthy();
    });
    const transferDrawer = screen.getByRole('dialog', { name: 'Transférer' });
    const destinationButtons = within(transferDrawer).getAllByRole('button', {
      name: /Transférer vers/i,
    });
    expect(destinationButtons).toHaveLength(2);
    const destinationNames = destinationButtons.map(
      (button) => within(button).getByText(/Semaine/).textContent?.trim() ?? ''
    );
    expect(destinationNames).toEqual(['Semaine 1', 'Semaine 2']);
  });

  it('lance bien le transfert API au clic sur une destination', async () => {
    shellDocument();
    const monthId = '52bd55a5-9fb6-4f49-a56e-9a965985cf2e';
    const accountId = 'a66640a1-ab8e-472e-bdf9-5ba8207a8f2b';
    const months: MonthView[] = [
      {
        id: monthId,
        accountId,
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 1000,
        projectedBalance: 250,
        budgetGroups: [
          {
            title: 'Budgets',
            showAdd: true,
            budgets: [
              {
                name: 'Semaine 1',
                icon: '💰',
                allocated: 200,
                weeklyBudgetId: '3157ec1f-2ecc-4789-af7c-3926b71f7933',
                expenses: [],
              },
            ],
          },
        ],
        chargeGroups: [
          {
            title: 'Charges',
            showAdd: true,
            charges: [{ id: 'c1', icon: '🏠', label: 'Loyer', amount: 500, taken: false }],
          },
        ],
      },
    ];

    const monthService = createMonthServiceFromInMemory({ months, transferDelayMs: 120 });
    const transferSpy = vi.spyOn(monthService, 'transferFromAccount');

    window.history.replaceState(null, '', `/outflows/${monthId}`);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService,
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Charges récurrentes', level: 1 })).toBeTruthy();
    });

    const recap = screen.getByRole('complementary', { name: 'Résumé du mois' });
    fireEvent.click(within(recap).getByRole('button', { name: 'Options du mois' }));
    await waitFor(() => {
      expect(within(recap).getByRole('button', { name: 'Transférer' })).toBeTruthy();
    });
    fireEvent.click(within(recap).getByRole('button', { name: 'Transférer' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Transférer' })).toBeTruthy();
    });
    const transferDrawer = screen.getByRole('dialog', { name: 'Transférer' });
    fireEvent.click(within(transferDrawer).getByRole('button', { name: 'Max' }));
    const firstDestinationButton = within(transferDrawer).getAllByRole('button', {
      name: /Transférer vers/i,
    })[0];
    expect(firstDestinationButton).toBeTruthy();
    fireEvent.click(firstDestinationButton);

    await waitFor(() => {
      expect(transferSpy).toHaveBeenCalledTimes(1);
    });
  });
});
