import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { LOADING_UPDATE_BUDGET_TEXT } from '../../src/application/month/month-store.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

const MONTH_ID = '52bd55a5-9fb6-4f49-a56e-9a965985cf2e';
const WEEK_B = 'ba460cbc-e812-4ee4-96c6-9d0f4e171ea2';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
    <buddj-emoji-picker-drawer id="emoji-picker-drawer"></buddj-emoji-picker-drawer>
    <buddj-budget-edit-drawer id="budget-edit-drawer"></buddj-budget-edit-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

function openBudgetEditFromCard(card: HTMLElement): void {
  const dropdown = card.querySelector('buddj-actions-dropdown');
  expect(dropdown).toBeTruthy();
  dropdown!.dispatchEvent(
    new CustomEvent('buddj-dropdown-action', {
      bubbles: true,
      composed: true,
      detail: { actionId: 'edit', targetId: '' },
    }),
  );
}

describe('modification budget → PATCH (in-memory)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('après validation : le titre et l’icône reflètent le nom API (ex. 🔥 + libellé)', async () => {
    shellDocument();
    const months: MonthView[] = [
      {
        id: MONTH_ID,
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 4000,
        projectedBalance: 138.3,
        budgetGroups: [
          {
            title: 'Budgets de Mars 2026',
            showAdd: true,
            budgets: [
              {
                name: 'Semaine 3',
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
      monthService: createMonthServiceFromInMemory({ months, updateBudgetDelayMs: 100 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });

    const card = screen.getByRole('heading', { name: 'Semaine 3', level: 2 }).closest('buddj-budget-card') as HTMLElement;
    openBudgetEditFromCard(card);

    const editDrawer = await screen.findByRole('dialog', { name: 'Modifier le budget' });
    fireEvent.input(within(editDrawer).getByRole('textbox', { name: 'Libellé du budget' }), {
      target: { value: 'Semaine 123' },
    });
    fireEvent.click(within(editDrawer).getByRole('button', { name: 'Choisir un emoji' }));
    const emojiPicker = await screen.findByRole('dialog', { name: 'Choisir un emoji' });
    fireEvent.click(within(emojiPicker).getByRole('button', { name: /Choisir 🔥/ }));

    fireEvent.click(within(editDrawer).getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_UPDATE_BUDGET_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_UPDATE_BUDGET_TEXT })).toBeNull();
    });

    const cardAfter = screen.getByRole('heading', { name: 'Semaine 123', level: 2 }).closest('buddj-budget-card') as HTMLElement;
    expect(cardAfter.querySelector('.budget-icon')?.textContent).toBe('🔥');
    expect(cardAfter.getAttribute('icon')).toBe('🔥');
    expect(cardAfter.getAttribute('name')).toBe('Semaine 123');
  });
});
