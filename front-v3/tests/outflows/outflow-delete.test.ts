import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { mapApiMonthPayloadToView, type ApiMonthPayload } from '../../src/adapters/map-api-month-to-view.js';
import { LOADING_DELETE_OUTFLOW_TEXT } from '../../src/application/month/month-store.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-confirm-modal id="archive-month-confirm"></buddj-confirm-modal>
    <buddj-month-search-drawer id="month-search-drawer"></buddj-month-search-drawer>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <buddj-charge-add-drawer id="charge-add-drawer"></buddj-charge-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

describe('suppression charge récurrente', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('supprime depuis la vue puis depuis le drawer de recherche', async () => {
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
          { id: 'o-1', amount: 100, label: '🏠 Loyer 2', isChecked: false, pendingFrom: null },
          { id: 'o-2', amount: 26.21, label: 'Adobe', isChecked: false, pendingFrom: null },
        ],
        weeklyBudgets: [],
      },
    };
    const month = mapApiMonthPayloadToView(dto);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [month], deleteOutflowDelayMs: 120 }),
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

    const loyerItem = Array.from(document.getElementsByTagName('buddj-charge-item')).find((el) => el.getAttribute('label') === 'Loyer 2');
    expect(loyerItem).toBeTruthy();
    fireEvent.click(within(loyerItem as HTMLElement).getByRole('button', { name: 'Supprimer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));
    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_DELETE_OUTFLOW_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_DELETE_OUTFLOW_TEXT })).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'La charge a bien été supprimée' })).toBeTruthy();
    });
    expect(Array.from(document.getElementsByTagName('buddj-charge-item')).some((el) => el.getAttribute('label') === 'Loyer 2')).toBe(false);

    const recap = screen.getByRole('complementary', { name: 'Résumé du mois' });
    fireEvent.click(within(recap).getByRole('button', { name: 'Options du mois' }));
    await waitFor(() => {
      expect(within(recap).getByRole('button', { name: 'Rechercher dans les charges ou les budgets' })).toBeTruthy();
    });
    fireEvent.click(within(recap).getByRole('button', { name: 'Rechercher dans les charges ou les budgets' }));
    const searchDrawer = document.getElementById('month-search-drawer') as HTMLElement;
    const searchInput = within(searchDrawer).getByRole('searchbox', { name: 'Rechercher par intitulé ou montant' });
    fireEvent.input(searchInput, { target: { value: 'Adobe' } });
    await waitFor(() => {
      expect(within(searchDrawer).getByRole('button', { name: 'Supprimer' })).toBeTruthy();
    });
    fireEvent.click(within(searchDrawer).getByRole('button', { name: 'Supprimer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));
    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_DELETE_OUTFLOW_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_DELETE_OUTFLOW_TEXT })).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'La charge a bien été supprimée' })).toBeTruthy();
    });
    await waitFor(() => {
      expect(within(searchDrawer).getByText('Aucun résultat')).toBeTruthy();
    });
    expect(Array.from(document.getElementsByTagName('buddj-charge-item')).some((el) => el.getAttribute('label') === 'Adobe')).toBe(false);
  });
});
