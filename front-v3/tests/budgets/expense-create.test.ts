import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { LOADING_CREATE_EXPENSE_TEXT } from '../../src/application/month/month-store.js';
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
    <buddj-emoji-picker-drawer id="emoji-picker-drawer"></buddj-emoji-picker-drawer>
    <buddj-expense-add-drawer id="expense-add-drawer"></buddj-expense-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

function recap(): HTMLElement {
  return screen.getByRole('complementary', { name: 'Résumé du mois' });
}

const WEEK_A = '3157ec1f-2ecc-4789-af7c-3926b71f7933';
const WEEK_B = '6f2923d1-3ae6-4df3-bb8a-e67f81300476';

describe('ajout dépense → POST (in-memory)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('après validation : dépense non cochée dans le bon budget, pas dans l’autre', async () => {
    shellDocument();
    const projectedBefore = 891.1;
    const amount = 12.36;
    const projectedAfter = Math.round((projectedBefore - amount) * 100) / 100;
    const months: MonthView[] = [
      {
        id: '52bd55a5-9fb6-4f49-a56e-9a965985cf2e',
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 4000,
        projectedBalance: projectedBefore,
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
              {
                name: 'Semaine 2',
                icon: '💰',
                allocated: 200,
                weeklyBudgetId: WEEK_B,
                expenses: [],
              },
            ],
          },
        ],
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, createExpenseDelayMs: 120 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    expect(within(recap()).getByText(formatEuros(projectedBefore))).toBeTruthy();

    const card1 = screen.getByRole('heading', { name: 'Semaine 1', level: 2 }).closest('buddj-budget-card') as HTMLElement;
    fireEvent.click(screen.getByRole('heading', { name: 'Semaine 1', level: 2 }).closest('summary')!);

    const addBtn = within(card1).getByRole('button', { name: 'Ajouter une dépense dans ce budget' });
    fireEvent.click(addBtn);

    const expenseDrawer = document.getElementById('expense-add-drawer')!;
    await waitFor(() => {
      expect(expenseDrawer.classList.contains('expense-add-drawer--open')).toBe(true);
    });

    const labelInput = within(expenseDrawer).getByRole('textbox', { name: 'Libellé de la dépense' });
    fireEvent.input(labelInput, { target: { value: 'Toto' } });

    fireEvent.click(expenseDrawer.querySelector('[data-expense-add-amount]')!);
    const calc = document.getElementById('calculator-drawer')!;
    await waitFor(() => {
      expect(calc.classList.contains('calculator-drawer--open')).toBe(true);
    });
    for (const digit of ['1', '2', ',', '3', '6'] as const) {
      const sel = digit === ',' ? '[data-digit=","]' : `[data-digit="${digit}"]`;
      fireEvent.click(calc.querySelector(sel)!);
    }
    fireEvent.click(within(calc).getByRole('button', { name: 'Valider' }));

    fireEvent.click(within(expenseDrawer).getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_CREATE_EXPENSE_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_CREATE_EXPENSE_TEXT })).toBeNull();
    });

    const card1After = screen.getByRole('heading', { name: 'Semaine 1', level: 2 }).closest('buddj-budget-card') as HTMLElement;
    const card2After = screen.getByRole('heading', { name: 'Semaine 2', level: 2 }).closest('buddj-budget-card') as HTMLElement;

    const cbTotoS1 = within(card1After).getByRole('checkbox', { name: /Toto/ }) as HTMLInputElement;
    expect(cbTotoS1.checked).toBe(false);

    expect(within(card2After).queryByRole('checkbox', { name: /Toto/ })).toBeNull();

    expect(within(recap()).getByText(formatEuros(projectedAfter))).toBeTruthy();
  });
});
