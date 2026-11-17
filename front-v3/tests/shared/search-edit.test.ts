/**
 * « Modifier » depuis les drawers de recherche (menu ⋮ des lignes miroir).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { createTemplateServiceFromInMemory } from '../../src/adapters/template-service-from-in-memory.js';
import { mapApiMonthPayloadToView, type ApiMonthPayload } from '../../src/adapters/map-api-month-to-view.js';
import type { MonthService } from '../../src/application/month/month-service.js';
import type { TemplateView } from '../../src/application/template/template-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';
import { clickLineMenuAction, fillLineDrawer } from '../helpers/line-menu.js';

const WEEK_ID = '3157ec1f-2ecc-4789-af7c-3926b71f7933';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <buddj-month-search-drawer id="month-search-drawer"></buddj-month-search-drawer>
    <buddj-charge-search-drawer id="charge-search-drawer"></buddj-charge-search-drawer>
    <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
    <buddj-emoji-picker-drawer id="emoji-picker-drawer"></buddj-emoji-picker-drawer>
    <buddj-charge-add-drawer id="charge-add-drawer"></buddj-charge-add-drawer>
    <buddj-expense-add-drawer id="expense-add-drawer"></buddj-expense-add-drawer>
    <buddj-budget-add-drawer id="budget-add-drawer"></buddj-budget-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

function seedMonth(): ApiMonthPayload {
  return {
    id: '52bd55a5-9fb6-4f49-a56e-9a965985cf2e',
    date: '2026-03-01T00:00:00.000Z',
    dashboard: {
      account: { currentBalance: 4000, forecastBalance: 150.3 },
      weeks: { weeklyBudgets: [] },
    },
    account: {
      id: 'a66640a1-ab8e-472e-bdf9-5ba8207a8f2b',
      currentBalance: 4000,
      outflows: [{ id: 'o-1', amount: 100, label: '🏠 Loyer', isChecked: false, pendingFrom: null }],
      weeklyBudgets: [
        {
          id: WEEK_ID,
          name: 'Semaine 1',
          initialBalance: 200,
          currentBalance: 185,
          pendingFrom: null,
          expenses: [{ id: 'e-1', label: '🌯 Kebab', amount: 15, isChecked: false, date: '2026-03-02T00:00:00.000Z' }],
        },
      ],
    },
  } as unknown as ApiMonthPayload;
}

async function openMonthSearch(query: string): Promise<HTMLElement> {
  const recap = screen.getByRole('complementary', { name: 'Résumé du mois' });
  fireEvent.click(within(recap).getByRole('button', { name: 'Options du mois' }));
  await waitFor(() => {
    expect(within(recap).getByRole('button', { name: 'Rechercher dans les charges ou les budgets' })).toBeTruthy();
  });
  fireEvent.click(within(recap).getByRole('button', { name: 'Rechercher dans les charges ou les budgets' }));
  const searchDrawer = document.getElementById('month-search-drawer') as HTMLElement;
  fireEvent.input(within(searchDrawer).getByRole('searchbox', { name: 'Rechercher par intitulé ou montant' }), {
    target: { value: query },
  });
  return searchDrawer;
}

function mirrorRow(searchDrawer: HTMLElement, label: string): Element {
  const row = Array.from(searchDrawer.querySelectorAll('buddj-line-item')).find(
    (el) => el.getAttribute('label') === label,
  );
  if (!row) throw new Error(`Ligne « ${label} » absente des résultats`);
  return row;
}

describe('« Modifier » depuis la recherche du mois', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('modifie une charge absente de l’écran courant (Budgets) puis une dépense, et rafraîchit les résultats', async () => {
    shellDocument();
    const month = mapApiMonthPayloadToView(seedMonth());
    const service = createMonthServiceFromInMemory({ months: [month] });
    const outflowCalls: Parameters<MonthService['updateOutflow']>[0][] = [];
    const expenseCalls: Parameters<MonthService['updateExpense']>[0][] = [];
    const spied: MonthService = {
      ...service,
      updateOutflow: (input) => {
        outflowCalls.push(input);
        return service.updateOutflow(input);
      },
      updateExpense: (input) => {
        expenseCalls.push(input);
        return service.updateExpense(input);
      },
    };
    bootstrap({ authService: createAuthServiceFromInMemory(true), monthService: spied });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    expect(document.querySelector('buddj-charge-item')).toBeNull();

    const searchDrawer = await openMonthSearch('Loyer');
    await waitFor(() => mirrorRow(searchDrawer, 'Loyer'));
    clickLineMenuAction(mirrorRow(searchDrawer, 'Loyer'), 'edit');
    const chargeDrawer = document.getElementById('charge-add-drawer')!;
    await waitFor(() => {
      expect(chargeDrawer.classList.contains('charge-add-drawer--open')).toBe(true);
    });
    await fillLineDrawer({ drawer: chargeDrawer, prefix: 'charge', label: 'Loyer T3', amountDigits: ['1', '2', '0'], waitFor });
    await waitFor(() => {
      expect(outflowCalls).toEqual([{ monthId: month.id, outflowId: 'o-1', label: '🏠 Loyer T3', amount: 120 }]);
    });
    await waitFor(() => {
      expect(mirrorRow(searchDrawer, 'Loyer T3').getAttribute('amount')).toBe('120');
    });

    fireEvent.input(within(searchDrawer).getByRole('searchbox', { name: 'Rechercher par intitulé ou montant' }), {
      target: { value: 'Kebab' },
    });
    await waitFor(() => mirrorRow(searchDrawer, 'Kebab'));
    clickLineMenuAction(mirrorRow(searchDrawer, 'Kebab'), 'edit');
    const expenseDrawer = document.getElementById('expense-add-drawer')!;
    await waitFor(() => {
      expect(expenseDrawer.classList.contains('expense-add-drawer--open')).toBe(true);
    });
    expect(expenseDrawer.querySelector('[data-expense-add-emoji]')!.textContent).toBe('🌯');
    await fillLineDrawer({ drawer: expenseDrawer, prefix: 'expense', label: 'Kebab frites', amountDigits: ['1', '8'], waitFor });
    await waitFor(() => {
      expect(expenseCalls).toEqual([
        { monthId: month.id, weeklyBudgetId: WEEK_ID, expenseId: 'e-1', label: '🌯 Kebab frites', amount: 18 },
      ]);
    });
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'La dépense a bien été modifiée' })).toBeTruthy();
    });
  });
});

describe('« Modifier » depuis la recherche des charges d’un template', () => {
  it('ouvre l’édition de la vraie ligne et rafraîchit les résultats', async () => {
    shellDocument();
    const TEMPLATE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const template: TemplateView = {
      id: TEMPLATE_ID,
      name: '📆 Modèle test',
      isDefault: false,
      month: '2026-01-01T00:00:00.000Z',
      startingBalance: 0,
      outflows: [{ id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', label: '⚡ EDF', amount: 60, isChecked: false, pendingFrom: null }],
      budgets: [],
    };
    window.history.replaceState(null, '', `/templates/${TEMPLATE_ID}`);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [] }),
      templateService: createTemplateServiceFromInMemory({ templates: [template], delayMs: 0 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });

    const searchHost = document.getElementById('charge-search-drawer') as HTMLElement & { open: () => void };
    searchHost.open();
    fireEvent.input(within(searchHost).getByRole('searchbox'), { target: { value: 'EDF' } });
    await waitFor(() => mirrorRow(searchHost, 'EDF'));
    clickLineMenuAction(mirrorRow(searchHost, 'EDF'), 'edit');

    const chargeDrawer = document.getElementById('charge-add-drawer')!;
    await waitFor(() => {
      expect(chargeDrawer.classList.contains('charge-add-drawer--open')).toBe(true);
    });
    await fillLineDrawer({ drawer: chargeDrawer, prefix: 'charge', label: 'EDF élec', amountDigits: ['7', '5'], waitFor });

    await waitFor(() => {
      const item = document.querySelector('#template-detail buddj-charge-item');
      expect(item?.getAttribute('label')).toBe('EDF élec');
      expect(item?.getAttribute('amount')).toBe('75');
    });
    await waitFor(() => {
      expect(mirrorRow(searchHost, 'EDF élec').getAttribute('amount')).toBe('75');
    });
  });
});
