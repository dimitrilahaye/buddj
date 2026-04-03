import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function minimalMonth(id: string, displayLabel: string): MonthView {
  return {
    id,
    isoDate: '2026-03-01T00:00:00.000Z',
    currentBalance: 100,
    projectedBalance: 50,
    displayLabel,
    budgetGroups: [],
    chargeGroups: [],
  };
}

function shell(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="archive-month-confirm"></buddj-confirm-modal>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <main id="screen-outlet" role="main"></main>
  `;
}

describe('alignement mois ↔ URL (budgets / outflows)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('avec /budgets/:monthId, affiche le mois correspondant après chargement', async () => {
    shell();
    const idA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const idB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const months: MonthView[] = [
      minimalMonth(idA, 'Mars 2026'),
      minimalMonth(idB, 'Avril 2026'),
    ];
    window.history.replaceState(null, '', `/budgets/${idB}`);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, delayMs: 0 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText('Avril 2026')).toBeTruthy();
    });
    expect(window.location.pathname).toBe(`/budgets/${idB}`);
  });

  it('avec /budgets sans id, affiche le comportement par défaut puis met l’URL à jour avec l’id du mois courant', async () => {
    shell();
    const idA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const months: MonthView[] = [minimalMonth(idA, 'Mars 2026')];
    window.history.replaceState(null, '', '/budgets');
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, delayMs: 0 }),
    });

    await waitFor(() => {
      expect(screen.getByText('Mars 2026')).toBeTruthy();
    });
    expect(window.location.pathname).toBe(`/budgets/${idA}`);
  });

  it('avec /budgets/:id inconnu, toast d’erreur et URL corrigée sur le mois affiché', async () => {
    shell();
    const idA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const months: MonthView[] = [minimalMonth(idA, 'Mars 2026')];
    window.history.replaceState(null, '', '/budgets/99999999-9999-9999-9999-999999999999');
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, delayMs: 0 }),
    });

    await waitFor(() => {
      expect(screen.getByText('Mars 2026')).toBeTruthy();
    });
    await waitFor(() => {
      expect(
        screen.getByRole('alert', { name: 'Ce mois n’est pas disponible dans la liste des mois non archivés.' }),
      ).toBeTruthy();
    });
    expect(window.location.pathname).toBe(`/budgets/${idA}`);
  });

  it('avec /outflows/:monthId, affiche le mois correspondant après chargement', async () => {
    shell();
    const idA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const idB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const months: MonthView[] = [
      minimalMonth(idA, 'Mars 2026'),
      minimalMonth(idB, 'Avril 2026'),
    ];
    window.history.replaceState(null, '', `/outflows/${idB}`);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, delayMs: 0 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Charges récurrentes', level: 1 })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText('Avril 2026')).toBeTruthy();
    });
    expect(window.location.pathname).toBe(`/outflows/${idB}`);
  });
});
