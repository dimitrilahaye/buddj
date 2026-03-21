import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import {
  LOADING_DELETE_BUDGET_TEXT,
} from '../../src/application/month/month-store.js';
import { formatEuros } from '../../src/shared/goal.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

const MID = '52bd55a5-9fb6-4f49-a56e-9a965985cf2e';
const WEEK_BLOCKED = '3157ec1f-2ecc-4789-af7c-3926b71f7933';
const WEEK_EMPTY = 'e0931cbb-e29d-424e-9771-a51cbb4a068d';
const WEEK_STAYS = '6f2923d1-3ae6-4df3-bb8a-e67f81300476';

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

function openBudgetCardByTitle(title: string): HTMLElement {
  const heading = screen.getByRole('heading', { name: title, level: 2 });
  const summary = heading.closest('summary');
  expect(summary).toBeTruthy();
  fireEvent.click(summary!);
  const card = summary!.closest('buddj-budget-card');
  expect(card).toBeTruthy();
  return card as HTMLElement;
}

function openBudgetDeleteConfirmFromCard(card: HTMLElement): void {
  const dropdown = card.querySelector('buddj-actions-dropdown');
  expect(dropdown).toBeTruthy();
  dropdown!.dispatchEvent(
    new CustomEvent('buddj-dropdown-action', {
      bubbles: true,
      composed: true,
      detail: { actionId: 'delete', targetId: '' },
    }),
  );
}

function confirmGlobalDeleteModal(): void {
  const confirmBtn = document.querySelector('#delete-confirm-modal .confirm-modal-btn--confirm');
  expect(confirmBtn).toBeTruthy();
  fireEvent.click(confirmBtn!);
}

describe('suppression budget → DELETE /months/.../budgets/... (in-memory)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('422 : toast d’erreur avec le message API, le budget reste affiché', async () => {
    shellDocument();
    const months: MonthView[] = [
      {
        id: MID,
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 4000,
        projectedBalance: 800,
        budgetGroups: [
          {
            title: 'Budgets de Mars 2026',
            showAdd: true,
            budgets: [
              {
                name: 'Bloqué',
                icon: '💰',
                allocated: 200,
                weeklyBudgetId: WEEK_BLOCKED,
                expenses: [
                  {
                    id: 'e1',
                    icon: '💰',
                    desc: 'Courses',
                    amount: 10,
                    taken: false,
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
      monthService: createMonthServiceFromInMemory({ months, deleteBudgetDelayMs: 80 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });

    const card = openBudgetCardByTitle('Bloqué');
    openBudgetDeleteConfirmFromCard(card);
    confirmGlobalDeleteModal();

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_DELETE_BUDGET_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_DELETE_BUDGET_TEXT })).toBeNull();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('alert', { name: 'Vous ne pouvez pas supprimer ce budget' }),
      ).toBeTruthy();
    });
    expect(screen.getByRole('heading', { name: 'Bloqué', level: 2 })).toBeTruthy();
  });

  it('200 : loader puis disparition du budget, solde prévisionnel à jour, toast succès', async () => {
    shellDocument();
    const projectedBefore = 855.8;
    const projectedAfter = Math.round((projectedBefore + 200) * 10) / 10;
    const months: MonthView[] = [
      {
        id: MID,
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
                name: 'À supprimer',
                icon: '📭',
                allocated: 200,
                weeklyBudgetId: WEEK_EMPTY,
                expenses: [],
              },
              {
                name: 'Reste',
                icon: '💰',
                allocated: 200,
                weeklyBudgetId: WEEK_STAYS,
                expenses: [
                  {
                    id: 'e2',
                    icon: '💰',
                    desc: 'Ligne',
                    amount: 5,
                    taken: false,
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
      monthService: createMonthServiceFromInMemory({ months, deleteBudgetDelayMs: 80 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    expect(within(recap()).getByText(formatEuros(projectedBefore))).toBeTruthy();

    const card = openBudgetCardByTitle('À supprimer');
    openBudgetDeleteConfirmFromCard(card);
    confirmGlobalDeleteModal();

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_DELETE_BUDGET_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_DELETE_BUDGET_TEXT })).toBeNull();
    });

    expect(screen.queryByRole('heading', { name: 'À supprimer', level: 2 })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Reste', level: 2 })).toBeTruthy();
    expect(within(recap()).getByText(formatEuros(projectedAfter))).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Le budget a bien été supprimé' })).toBeTruthy();
    });
  });
});
