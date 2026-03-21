import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { LOADING_DELETE_EXPENSE_TEXT } from '../../src/application/month/month-store.js';
import { formatEuros } from '../../src/shared/goal.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <main id="screen-outlet" role="main"></main>
  `;
}

function recap(): HTMLElement {
  return screen.getByRole('complementary', { name: 'Résumé du mois' });
}

const WEEK_A = '3157ec1f-2ecc-4789-af7c-3926b71f7933';
const EXP_KEBAB = '61ea3119-0ee7-4403-b672-41955c3541bf';
const EXP_INTER = '29f57d2d-17dd-47e8-9227-6c684babb893';

describe('suppression dépense → DELETE (in-memory)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('après confirmation : modal chargement, store à jour, ligne disparue, solde prévisionnel', async () => {
    shellDocument();
    const projectedBefore = 891.1;
    const projectedAfter = Math.round((projectedBefore - 35.3) * 10) / 10;
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
                expenses: [
                  {
                    id: EXP_KEBAB,
                    icon: '💰',
                    desc: 'Kebab',
                    amount: 15,
                    taken: false,
                  },
                  {
                    id: EXP_INTER,
                    icon: '💰',
                    desc: 'Intermarché',
                    amount: 20.3,
                    taken: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, deleteDelayMs: 120 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    expect(within(recap()).getByText(formatEuros(projectedBefore))).toBeTruthy();

    const semaineHeading = screen.getByRole('heading', { name: 'Semaine 1', level: 2 });
    const summary = semaineHeading.closest('summary');
    expect(summary).toBeTruthy();
    fireEvent.click(summary!);

    const interItem = screen.getByRole('checkbox', { name: /Intermarché/ }).closest('buddj-expense-item');
    expect(interItem).toBeTruthy();
    const deleteBtn = interItem!.querySelector('buddj-icon-delete');
    expect(deleteBtn).toBeTruthy();
    fireEvent.click(deleteBtn!);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_DELETE_EXPENSE_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_DELETE_EXPENSE_TEXT })).toBeNull();
    });

    expect(screen.queryByRole('checkbox', { name: /Intermarché/ })).toBeNull();
    expect((screen.getByRole('checkbox', { name: /Kebab/ }) as HTMLInputElement).checked).toBe(false);
    expect(within(recap()).getByText(formatEuros(projectedAfter))).toBeTruthy();
  });
});
