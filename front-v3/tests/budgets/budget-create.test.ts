import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { LOADING_CREATE_BUDGET_TEXT } from '../../src/application/month/month-store.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
    <buddj-emoji-picker-drawer id="emoji-picker-drawer"></buddj-emoji-picker-drawer>
    <buddj-budget-add-drawer id="budget-add-drawer"></buddj-budget-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

const WEEK_A = '3157ec1f-2ecc-4789-af7c-3926b71f7933';

describe('création budget → POST (in-memory)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('après validation : le nouveau budget apparaît dans la liste', async () => {
    shellDocument();
    const months: MonthView[] = [
      {
        id: '52bd55a5-9fb6-4f49-a56e-9a965985cf2e',
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 4000,
        projectedBalance: 500,
        budgetGroups: [
          {
            title: 'Budgets de Mars 2026',
            showAdd: true,
            budgets: [
              {
                name: 'Semaine 1',
                icon: '💰',
                allocated: 200,
                weeklyBudgetId: WEEK_A,
                expenses: [],
              },
            ],
          },
        ],
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, createBudgetDelayMs: 120 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });

    const budgetsMain = screen.getByRole('heading', { name: 'Mes budgets', level: 1 }).closest('main') as HTMLElement;
    fireEvent.click(within(budgetsMain).getByRole('button', { name: 'Ajouter un budget' }));

    const budgetDrawer = await screen.findByRole('dialog', { name: 'Ajouter un budget' });

    fireEvent.input(within(budgetDrawer).getByRole('textbox', { name: 'Libellé du budget' }), {
      target: { value: 'Test' },
    });

    fireEvent.click(within(budgetDrawer).getByRole('button', { name: 'Choisir un emoji' }));
    const emojiPicker = await screen.findByRole('dialog', { name: 'Choisir un emoji' });
    fireEvent.click(within(emojiPicker).getByRole('button', { name: /Choisir 🔥/ }));

    fireEvent.click(within(budgetDrawer).getByRole('button', { name: 'Montant (ouvrir la calculatrice)' }));
    const calc = await screen.findByRole('dialog', { name: 'Montant' });
    for (const digit of ['1', '2', '3', '0'] as const) {
      fireEvent.click(within(calc).getByRole('button', { name: digit }));
    }
    fireEvent.click(within(calc).getByRole('button', { name: 'Valider' }));

    fireEvent.click(within(budgetDrawer).getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_CREATE_BUDGET_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_CREATE_BUDGET_TEXT })).toBeNull();
    });

    expect(screen.getByRole('heading', { name: 'Semaine 1', level: 2 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Test', level: 2 })).toBeTruthy();
  });
});
