import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <main id="screen-outlet" role="main"></main>
  `;
}

function minimalMonth(overrides: Partial<MonthView> & Pick<MonthView, 'id' | 'displayLabel'>): MonthView {
  return {
    isoDate: '2026-02-01T00:00:00.000Z',
    currentBalance: 100,
    projectedBalance: 50,
    budgetGroups: [],
    ...overrides,
  };
}

describe('écran mois archivés (API in-memory)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('charge la liste et permet de désarchiver un mois', async () => {
    shellDocument();
    const archId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    window.history.replaceState(null, '', '/archived');
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({
        months: [],
        archivedMonths: [minimalMonth({ id: archId, displayLabel: 'Février 2026' })],
        delayMs: 0,
      }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mois archivés', level: 1 })).toBeTruthy();
      expect(screen.getByRole('listitem', { name: 'Février 2026' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Désarchiver' }));
    await waitFor(() => {
      expect(screen.getByText(/désarchiver le mois Février 2026/i)).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Le mois a bien été désarchivé' })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('listitem', { name: 'Février 2026' })).toBeNull();
    });
    expect(screen.getByText('Aucun mois archivé.')).toBeTruthy();
  });

  it('supprime définitivement un mois archivé et met à jour la liste', async () => {
    shellDocument();
    const id1 = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
    const id2 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    window.history.replaceState(null, '', '/archived');
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({
        months: [],
        archivedMonths: [
          minimalMonth({ id: id1, displayLabel: 'Janvier 2026', isoDate: '2026-01-01T00:00:00.000Z' }),
          minimalMonth({ id: id2, displayLabel: 'Février 2026', isoDate: '2026-02-01T00:00:00.000Z' }),
        ],
        delayMs: 0,
      }),
    });

    await waitFor(() => {
      expect(screen.getByRole('listitem', { name: 'Janvier 2026' })).toBeTruthy();
      expect(screen.getByRole('listitem', { name: 'Février 2026' })).toBeTruthy();
    });

    const januaryRow = screen.getByRole('listitem', { name: 'Janvier 2026' });
    fireEvent.click(
      within(januaryRow).getByRole('button', { name: 'Supprimer définitivement ce mois' }),
    );

    await waitFor(() => {
      expect(screen.getByText(/supprimer définitivement le mois Janvier 2026/i)).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Le mois a bien été supprimé' })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('listitem', { name: 'Janvier 2026' })).toBeNull();
    });
    expect(screen.getByRole('listitem', { name: 'Février 2026' })).toBeTruthy();
  });
});
