import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { LOADING_TRANSFER_BUDGET_TEXT } from '../../src/application/month/month-store.js';
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
    <buddj-transfer-drawer id="transfer-drawer"></buddj-transfer-drawer>
    <buddj-emoji-picker-drawer id="emoji-picker-drawer"></buddj-emoji-picker-drawer>
    <buddj-expense-add-drawer id="expense-add-drawer"></buddj-expense-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

describe('transfert account -> budget', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('valide drawer, Max, Remettre à 0, loading, toast succès et refresh vue', async () => {
    shellDocument();
    const accountId = 'a66640a1-ab8e-472e-bdf9-5ba8207a8f2b';
    const weekA = '3157ec1f-2ecc-4789-af7c-3926b71f7933';
    const weekB = 'ba460cbc-e812-4ee4-96c6-9d0f4e171ea2';
    const months: MonthView[] = [
      {
        id: '52bd55a5-9fb6-4f49-a56e-9a965985cf2e',
        accountId,
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 4000,
        projectedBalance: 150.3,
        budgetGroups: [
          {
            title: 'Budgets de Mars 2026',
            showAdd: true,
            budgets: [
              {
                name: 'Semaine 123',
                icon: '💰',
                allocated: 212,
                weeklyBudgetId: weekA,
                expenses: [{ id: 'exp-a', icon: '💰', desc: 'Toto', amount: 25, taken: false }],
              },
              {
                name: 'Semaine 3',
                icon: '💰',
                allocated: 100,
                weeklyBudgetId: weekB,
                expenses: [{ id: 'exp-b', icon: '💰', desc: 'Courses', amount: 120, taken: false }],
              },
            ],
          },
        ],
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, transferDelayMs: 120 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
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
    const transferDrawer = screen.getByRole('dialog', { name: 'Transférer' }) as HTMLElement;

    const destinationButtons = within(transferDrawer).getAllByRole('button', { name: /Transférer vers/i });
    expect(destinationButtons).toHaveLength(2);
    const budgetDestination = destinationButtons.find((btn) =>
      within(btn as HTMLElement).queryByText('Semaine 3'),
    ) as HTMLElement;
    expect(budgetDestination.dataset.destinationId).toBe(weekB);
    expect(within(budgetDestination).getAllByText(formatEuros(-20)).length).toBeGreaterThan(0);

    fireEvent.click(within(transferDrawer).getByRole('button', { name: 'Max' }));
    expect(within(transferDrawer).getByRole('button', { name: 'Montant (ouvrir la calculatrice)' }).textContent?.trim()).toBe(
      formatEuros(150.3),
    );

    const resetToZeroBtn = within(transferDrawer)
      .getAllByRole('button', { name: 'Remettre cette destination à zéro' })
      .find((btn) => !(btn as HTMLButtonElement).disabled) as HTMLButtonElement;
    expect(resetToZeroBtn.disabled).toBe(false);
    fireEvent.click(resetToZeroBtn);
    expect(within(transferDrawer).getByRole('button', { name: 'Montant (ouvrir la calculatrice)' }).textContent?.trim()).toBe(
      formatEuros(20),
    );

    fireEvent.click(budgetDestination);

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_TRANSFER_BUDGET_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_TRANSFER_BUDGET_TEXT })).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Le transfert a bien été effectué' })).toBeTruthy();
    });

    const destinationCardAfter = screen.getByRole('heading', { name: 'Semaine 3', level: 2 }).closest('buddj-budget-card') as HTMLElement;
    expect(destinationCardAfter.getAttribute('remaining')).toBe('0');

    expect(within(recap).getByText(formatEuros(130.3))).toBeTruthy();
  });
});
