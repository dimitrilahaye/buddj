import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { LOADING_UPDATE_EXPENSE_TEXT } from '../../src/application/month/month-store.js';
import type { MonthService } from '../../src/application/month/month-service.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import { formatEuros } from '../../src/shared/goal.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';
import { clickLineMenuAction, fillLineDrawer } from '../helpers/line-menu.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
    <buddj-emoji-picker-drawer id="emoji-picker-drawer"></buddj-emoji-picker-drawer>
    <buddj-expense-add-drawer id="expense-add-drawer"></buddj-expense-add-drawer>
    <buddj-budget-edit-drawer id="budget-edit-drawer"></buddj-budget-edit-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

const WEEK_A = '3157ec1f-2ecc-4789-af7c-3926b71f7933';
const EXP_KEBAB = '61ea3119-0ee7-4403-b672-41955c3541bf';

function seedMonths(): MonthView[] {
  return [
    {
      id: '52bd55a5-9fb6-4f49-a56e-9a965985cf2e',
      isoDate: '2026-03-01T00:00:00.000Z',
      displayLabel: 'Mars 2026',
      currentBalance: 4000,
      projectedBalance: 891.1,
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
              expenses: [{ id: EXP_KEBAB, icon: '🌯', desc: 'Kebab', amount: 15, taken: true }],
            },
          ],
        },
      ],
    },
  ];
}

describe('modification dépense → PUT (in-memory)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('menu ⋮ → Modifier : drawer pré-rempli, envoi libellé API + montant, ligne mise à jour', async () => {
    shellDocument();
    const service = createMonthServiceFromInMemory({ months: seedMonths(), updateLineDelayMs: 120 });
    const calls: Parameters<MonthService['updateExpense']>[0][] = [];
    const spied: MonthService = {
      ...service,
      updateExpense: (input) => {
        calls.push(input);
        return service.updateExpense(input);
      },
    };
    bootstrap({ authService: createAuthServiceFromInMemory(true), monthService: spied });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('heading', { name: 'Semaine 1', level: 2 }).closest('summary')!);

    const kebab = screen.getByRole('checkbox', { name: /Kebab/ }).closest('buddj-expense-item')!;
    clickLineMenuAction(kebab, 'edit');

    const drawer = document.getElementById('expense-add-drawer')!;
    await waitFor(() => {
      expect(drawer.classList.contains('expense-add-drawer--open')).toBe(true);
    });
    expect(within(drawer).getByRole('heading', { name: 'Modifier la dépense' })).toBeTruthy();
    expect((drawer.querySelector('[data-expense-add-label]') as HTMLInputElement).value).toBe('Kebab');
    expect(drawer.querySelector('[data-expense-add-amount]')!.textContent).toBe(formatEuros(15));
    expect(drawer.querySelector('[data-expense-add-emoji]')!.textContent).toBe('🌯');
    // Le menu de la dépense ne doit pas ouvrir l’édition du budget parent.
    expect(document.getElementById('budget-edit-drawer')!.classList.contains('budget-edit-drawer--open')).toBe(false);

    await fillLineDrawer({ drawer, prefix: 'expense', label: 'Kebab frites', amountDigits: ['1', '8'], waitFor });

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_UPDATE_EXPENSE_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_UPDATE_EXPENSE_TEXT })).toBeNull();
    });

    expect(calls).toEqual([
      {
        monthId: '52bd55a5-9fb6-4f49-a56e-9a965985cf2e',
        weeklyBudgetId: WEEK_A,
        expenseId: EXP_KEBAB,
        label: '🌯 Kebab frites',
        amount: 18,
      },
    ]);
    const updated = screen.getByRole('checkbox', { name: /Kebab frites/ }) as HTMLInputElement;
    expect(updated.getAttribute('aria-label')).toBe(`Dépense Kebab frites, ${formatEuros(18)}`);
    expect(updated.checked).toBe(true);
  });
});
