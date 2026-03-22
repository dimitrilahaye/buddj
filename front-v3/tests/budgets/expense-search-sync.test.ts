import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import {
  LOADING_DELETE_EXPENSE_TEXT,
  LOADING_EXPENSES_CHECKING_TEXT,
} from '../../src/application/month/month-store.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

const MID = '52bd55a5-9fb6-4f49-a56e-9a965985cf2e';
const WEEK_A = '3157ec1f-2ecc-4789-af7c-3926b71f7933';
const EXP_KEBAB = '61ea3119-0ee7-4403-b672-41955c3541bf';
const EXP_INTER = '29f57d2d-17dd-47e8-9227-6c684babb893';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-expense-search-drawer id="expense-search-drawer"></buddj-expense-search-drawer>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <main id="screen-outlet" role="main"></main>
  `;
}

/** Le <main> de l’écran Mes budgets (celui qui contient le titre « Mes budgets »). */
function budgetsScreenMain(): HTMLElement {
  const h1 = screen.getByRole('heading', { name: 'Mes budgets', level: 1 });
  const main = h1.closest('main');
  if (!main) throw new Error('main budgets introuvable');
  return main as HTMLElement;
}

function expenseSearchDialog(): HTMLElement {
  return screen.getByRole('dialog', { name: /Rechercher une dépense/i });
}

function kebabCheckboxInMain(): HTMLInputElement {
  return within(budgetsScreenMain()).getByRole('checkbox', { name: /Kebab/ }) as HTMLInputElement;
}

async function openExpenseSearchAndFilter(query: string): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la recherche' }));
  const input = screen.getByRole('searchbox', { name: /Rechercher par intitulé ou montant/i });
  fireEvent.input(input, { target: { value: query } });
  await waitFor(() => {
    expect(within(expenseSearchDialog()).getByRole('checkbox', { name: /Kebab/ })).toBeTruthy();
  });
}

function mirrorKebabCheckboxInSearchDrawer(): HTMLInputElement {
  return within(expenseSearchDialog()).getByRole('checkbox', { name: /Kebab/ }) as HTMLInputElement;
}

function mirrorKebabDeleteInSearchDrawer(): HTMLElement {
  return within(expenseSearchDialog()).getByRole('button', { name: 'Supprimer' });
}

function baseMonth(overrides: Partial<MonthView> & { kebabTaken: boolean }): MonthView {
  const { kebabTaken, ...rest } = overrides;
  return {
    id: MID,
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
            expenses: [
              {
                id: EXP_KEBAB,
                icon: '💰',
                desc: 'Kebab',
                amount: 15,
                taken: kebabTaken,
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
    ...rest,
  };
}

describe('recherche dépenses ↔ vue générale (in-memory)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('coche une dépense dans la recherche → la vue générale reflète la case cochée', async () => {
    shellDocument();
    const months: MonthView[] = [baseMonth({ kebabTaken: false })];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, putDelayMs: 100 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    expect(kebabCheckboxInMain().checked).toBe(false);

    await openExpenseSearchAndFilter('Kebab');
    expect(mirrorKebabCheckboxInSearchDrawer().checked).toBe(false);
    fireEvent.click(mirrorKebabCheckboxInSearchDrawer());

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_EXPENSES_CHECKING_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_EXPENSES_CHECKING_TEXT })).toBeNull();
    });

    await waitFor(() => {
      expect(kebabCheckboxInMain().checked).toBe(true);
    });
  });

  it('décoche une dépense dans la recherche → la vue générale reflète la case décochée', async () => {
    shellDocument();
    const months: MonthView[] = [baseMonth({ kebabTaken: true })];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, putDelayMs: 100 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    expect(kebabCheckboxInMain().checked).toBe(true);

    await openExpenseSearchAndFilter('Kebab');
    expect(mirrorKebabCheckboxInSearchDrawer().checked).toBe(true);
    fireEvent.click(mirrorKebabCheckboxInSearchDrawer());

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_EXPENSES_CHECKING_TEXT })).toBeNull();
    });

    await waitFor(() => {
      expect(kebabCheckboxInMain().checked).toBe(false);
    });
  });

  it('supprime une dépense depuis la recherche → elle disparaît de la vue générale', async () => {
    shellDocument();
    const projectedBefore = 891.1;
    const months: MonthView[] = [
      {
        ...baseMonth({ kebabTaken: false }),
        projectedBalance: projectedBefore,
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, deleteDelayMs: 100 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    expect(kebabCheckboxInMain()).toBeTruthy();

    await openExpenseSearchAndFilter('Kebab');
    fireEvent.click(mirrorKebabDeleteInSearchDrawer());
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_DELETE_EXPENSE_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_DELETE_EXPENSE_TEXT })).toBeNull();
    });

    expect(within(budgetsScreenMain()).queryByRole('checkbox', { name: /Kebab/ })).toBeNull();
    expect(within(budgetsScreenMain()).getByRole('checkbox', { name: /Intermarché/ })).toBeTruthy();
  });
});
