import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="archive-month-confirm"></buddj-confirm-modal>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
    <buddj-transfer-drawer id="transfer-drawer"></buddj-transfer-drawer>
    <buddj-emoji-picker-drawer id="emoji-picker-drawer"></buddj-emoji-picker-drawer>
    <buddj-expense-add-drawer id="expense-add-drawer"></buddj-expense-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

describe('placeholder « aucun mois » (web component)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('affiche buddj-months-empty-placeholder sur Mes budgets et Charges récurrentes, barre récap masquée', async () => {
    shellDocument();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
    });

    const outlet = document.getElementById('screen-outlet')!;
    const summaryBar = document.querySelector('buddj-summary-bar');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    await waitFor(() => {
      expect(within(outlet).getByRole('region', { name: 'Aucun mois actif' })).toBeTruthy();
    });

    expect(outlet.querySelectorAll('buddj-months-empty-placeholder')).toHaveLength(1);
    expect(summaryBar?.hasAttribute('hidden')).toBe(true);
    const budgetsHeader = screen.getByRole('heading', { name: 'Mes budgets', level: 1 }).closest('header');
    expect(budgetsHeader?.querySelector('buddj-icon-search')).toBeNull();
    expect(budgetsHeader?.querySelector('buddj-toggle-all')?.hasAttribute('hidden')).toBe(true);

    const link = document.createElement('a');
    link.setAttribute('href', '/outflows/00000000-0000-0000-0000-000000000001');
    document.body.appendChild(link);
    fireEvent.click(link);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Charges récurrentes', level: 1 })).toBeTruthy();
    });
    await waitFor(() => {
      expect(within(outlet).getByRole('region', { name: 'Aucun mois actif' })).toBeTruthy();
    });
    expect(outlet.querySelectorAll('buddj-months-empty-placeholder')).toHaveLength(1);
    expect(summaryBar?.hasAttribute('hidden')).toBe(true);
  });
});
