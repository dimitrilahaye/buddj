import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import {
  LOADING_ARCHIVE_MONTH_TEXT,
} from '../../src/application/month/month-store.js';
import type { MonthView } from '../../src/application/month/month-view.js';
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

function minimalMonth(overrides: Partial<MonthView> & Pick<MonthView, 'id' | 'displayLabel'>): MonthView {
  return {
    isoDate: '2026-03-01T00:00:00.000Z',
    currentBalance: 100,
    projectedBalance: 50,
    budgetGroups: [],
    ...overrides,
  };
}

/** Même événement que `buddj-actions-dropdown` après clic sur « Archiver ce mois ». */
function fireArchiveMonthMenuAction(): void {
  screen.getByRole('complementary', { name: 'Résumé du mois' }).dispatchEvent(
    new CustomEvent('buddj-dropdown-action', {
      bubbles: true,
      composed: true,
      detail: { actionId: 'archive-month', targetId: '' },
    }),
  );
}

describe('archivage de mois', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('avec deux mois, après archivage du premier seul le second reste visible', async () => {
    shellDocument();
    const idA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const idB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const months: MonthView[] = [
      minimalMonth({ id: idA, displayLabel: 'Mars 2026' }),
      minimalMonth({ id: idB, displayLabel: 'Avril 2026', isoDate: '2026-04-01T00:00:00.000Z' }),
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, archiveMonthDelayMs: 80 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText('Mars 2026')).toBeTruthy();
    });

    fireArchiveMonthMenuAction();

    await waitFor(() => {
      expect(screen.getByText('Voulez-vous vraiment archiver ce mois ?')).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: LOADING_ARCHIVE_MONTH_TEXT })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_ARCHIVE_MONTH_TEXT })).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Le mois a bien été archivé' })).toBeTruthy();
    });

    expect(screen.queryByText('Mars 2026')).toBeNull();
    expect(screen.getByText('Avril 2026')).toBeTruthy();
  });

  it('avec un seul mois archivé, affiche le placeholder et le CTA vers la création de mois', async () => {
    shellDocument();
    const idA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const months: MonthView[] = [minimalMonth({ id: idA, displayLabel: 'Mars 2026' })];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, archiveMonthDelayMs: 40 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText('Mars 2026')).toBeTruthy();
    });

    fireArchiveMonthMenuAction();
    await waitFor(() => {
      expect(screen.getByText('Voulez-vous vraiment archiver ce mois ?')).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: LOADING_ARCHIVE_MONTH_TEXT })).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Aucun mois actif' })).toBeTruthy();
    });
    expect(screen.getByText('Aucun mois à afficher pour le moment.')).toBeTruthy();
    expect(within(screen.getByRole('region', { name: 'Aucun mois actif' })).getByRole('link', { name: 'Créer un mois' })).toBeTruthy();
  });

  it('clic sur le CTA du placeholder mène à la page de création de mois', async () => {
    shellDocument();
    const idA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const months: MonthView[] = [minimalMonth({ id: idA, displayLabel: 'Mars 2026' })];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, delayMs: 0 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText('Mars 2026')).toBeTruthy();
    });

    fireArchiveMonthMenuAction();
    await waitFor(() => {
      expect(screen.getByText('Voulez-vous vraiment archiver ce mois ?')).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(
        within(screen.getByRole('region', { name: 'Aucun mois actif' })).getByRole('link', { name: 'Créer un mois' }),
      ).toBeTruthy();
    });

    const region = screen.getByRole('region', { name: 'Aucun mois actif' });
    const cta = within(region).getByRole('link', { name: 'Créer un mois' }) as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/new-month');
    fireEvent.click(cta);

    expect(window.location.pathname).toBe('/new-month');
    const outlet = document.getElementById('screen-outlet');
    expect(outlet).toBeTruthy();
    await waitFor(() => {
      expect(
        within(outlet as HTMLElement).getByRole('heading', { name: 'Créer un nouveau mois', level: 1 }),
      ).toBeTruthy();
    });
  });

  it('affiche un toast d’erreur si l’archivage échoue', async () => {
    shellDocument();
    const idA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const months: MonthView[] = [minimalMonth({ id: idA, displayLabel: 'Mars 2026' })];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({
        months,
        archiveMonthDelayMs: 30,
        archiveMonthFailure: 'Archivage impossible côté serveur',
      }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText('Mars 2026')).toBeTruthy();
    });

    fireArchiveMonthMenuAction();
    await waitFor(() => {
      expect(screen.getByText('Voulez-vous vraiment archiver ce mois ?')).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(screen.getByRole('alert', { name: 'Archivage impossible côté serveur' })).toBeTruthy();
    });
    expect(screen.getByText('Mars 2026')).toBeTruthy();
  });
});
