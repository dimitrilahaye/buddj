import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { mapApiMonthPayloadToView, type ApiMonthPayload } from '../../src/adapters/map-api-month-to-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-charge-search-drawer id="charge-search-drawer"></buddj-charge-search-drawer>
    <buddj-charge-add-drawer id="charge-add-drawer"></buddj-charge-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

describe('outflows affiche les charges du mois courant', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('affiche les charges courantes et celles des mois précédents (pendingFrom)', async () => {
    shellDocument();
    const dto: ApiMonthPayload = {
      id: '52bd55a5-9fb6-4f49-a56e-9a965985cf2e',
      date: '2026-03-01T00:00:00.000Z',
      dashboard: {
        account: { currentBalance: 4000, forecastBalance: 150.3 },
        weeks: { weeklyBudgets: [] },
      },
      account: {
        id: 'a66640a1-ab8e-472e-bdf9-5ba8207a8f2b',
        currentBalance: 4000,
        outflows: [
          { id: 'o-1', amount: 699.41, label: '🏠 Loyer', isChecked: false, pendingFrom: null },
          { id: 'o-2', amount: 45, label: '🚋 TAN', isChecked: false, pendingFrom: null },
          { id: 'o-3', amount: 92.06, label: 'MACIF', isChecked: true, pendingFrom: '2026-02' },
        ],
        weeklyBudgets: [],
      },
    };
    const month = mapApiMonthPayloadToView(dto);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [month] }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    const goOutflows = document.createElement('a');
    goOutflows.setAttribute('href', `/outflows/${month.id}`);
    document.body.appendChild(goOutflows);
    fireEvent.click(goOutflows);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Charges récurrentes', level: 1 })).toBeTruthy();
    });

    expect(screen.queryByRole('heading', { name: 'Charges annuelles', level: 3 })).toBeNull();

    const chargeGroups = Array.from(document.querySelectorAll('buddj-charge-group'));
    expect(chargeGroups).toHaveLength(2);
    const previousGroup = chargeGroups.find((g) =>
      Array.from(g.querySelectorAll('buddj-charge-item')).some((el) => el.hasAttribute('previous')),
    );
    const currentGroup = chargeGroups.find((g) => g !== previousGroup);
    expect(previousGroup).toBeTruthy();
    expect(currentGroup).toBeTruthy();
    if (previousGroup == null || currentGroup == null) {
      throw new Error('expected previous and current buddj-charge-group');
    }

    const previousItems = Array.from(previousGroup.getElementsByTagName('buddj-charge-item'));
    const currentItems = Array.from(currentGroup.getElementsByTagName('buddj-charge-item'));
    expect(previousItems).toHaveLength(1);
    expect(currentItems).toHaveLength(2);

    expect(previousItems[0]?.getAttribute('label')).toBe('MACIF');
    expect(previousItems[0]?.getAttribute('amount')).toBe('92.06');
    expect(previousItems[0]?.hasAttribute('previous')).toBe(true);
    expect(previousItems[0]?.hasAttribute('taken')).toBe(true);

    expect(currentItems.map((i) => i.getAttribute('label'))).toEqual(['Loyer', 'TAN']);
    expect(currentItems.map((i) => i.getAttribute('amount'))).toEqual(['699.41', '45']);
    expect(currentItems.every((i) => !i.hasAttribute('previous'))).toBe(true);
  });
});
