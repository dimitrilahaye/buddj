import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { formatEuros } from '../../src/shared/goal.js';
import type { MonthView } from '../../src/application/month/month-view.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-summary-bar balance-value="0" date="" projected-balance="0"></buddj-summary-bar>
    <main id="screen-outlet" role="main"></main>
  `;
}

function recap(): HTMLElement {
  return screen.getByRole('complementary', { name: 'Résumé du mois' });
}

describe('mois non archivés (page budgets)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('affiche la modal « Chargement des mois en cours » pendant l’appel mois', async () => {
    shellDocument();
    const months: MonthView[] = [
      {
        id: 'm1',
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 0,
        projectedBalance: 0,
        budgetGroups: [],
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months, delayMs: 100 }),
    });
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Chargement des mois en cours' })).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'Chargement des mois en cours' })).toBeNull();
    });
  });

  it('affiche la date du premier mois dans le récap après chargement', async () => {
    shellDocument();
    const months: MonthView[] = [
      {
        id: 'm1',
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 0,
        projectedBalance: 0,
        budgetGroups: [],
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months }),
    });
    await waitFor(() => {
      expect(within(recap()).getByText('Mars 2026')).toBeTruthy();
    });
  });

  it('affiche solde actuel et solde prévisionnel du mois courant (store)', async () => {
    shellDocument();
    const months: MonthView[] = [
      {
        id: 'm1',
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 1966.46,
        projectedBalance: 412.5,
        budgetGroups: [],
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months }),
    });
    await waitFor(() => {
      const r = within(recap());
      expect(r.getByRole('button', { name: formatEuros(1966.46) })).toBeTruthy();
      expect(r.getByText(formatEuros(412.5))).toBeTruthy();
    });
  });

  it('affiche budgets mois précédent / en cours et dépenses cochées ou non', async () => {
    shellDocument();
    const months: MonthView[] = [
      {
        id: 'm1',
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 100,
        projectedBalance: 50,
        budgetGroups: [
          {
            title: 'Budgets des mois précédents',
            previous: true,
            budgets: [
              {
                name: 'Report',
                icon: '💰',
                allocated: 80,
                expenses: [
                  { icon: '💰', desc: 'Dépense reportée', amount: 10, taken: true },
                  { icon: '💰', desc: 'À faire', amount: 20, taken: false },
                ],
              },
            ],
          },
          {
            title: 'Budgets de Mars 2026',
            showAdd: true,
            budgets: [
              {
                name: 'Courses',
                icon: '🛒',
                allocated: 120,
                expenses: [
                  { icon: '💰', desc: 'Sans emoji prefix', amount: 5, taken: false },
                  { icon: '💰', desc: 'Payé', amount: 12, taken: true },
                ],
              },
            ],
          },
        ],
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mes budgets', level: 1 })).toBeTruthy();
    });
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect((screen.getByRole('checkbox', { name: /Dépense reportée/ }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('checkbox', { name: /À faire/ }) as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole('checkbox', { name: /Sans emoji prefix/ }) as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole('checkbox', { name: /Payé/ }) as HTMLInputElement).checked).toBe(true);
  });

  it('navigue entre 3 mois avec les boutons Mois précédent / Mois suivant (récap + budgets)', async () => {
    shellDocument();
    const months: MonthView[] = [
      {
        id: 'a',
        isoDate: '2026-01-01T00:00:00.000Z',
        displayLabel: 'Janvier 2026',
        currentBalance: 10,
        projectedBalance: 1,
        budgetGroups: [
          {
            title: 'Budgets de Janvier 2026',
            showAdd: true,
            budgets: [
              {
                name: 'Loisirs',
                icon: '🎮',
                allocated: 50,
                expenses: [{ icon: '💰', desc: 'Jeu A', amount: 5, taken: false }],
              },
            ],
          },
        ],
      },
      {
        id: 'b',
        isoDate: '2026-02-01T00:00:00.000Z',
        displayLabel: 'Février 2026',
        currentBalance: 20,
        projectedBalance: 2,
        budgetGroups: [
          {
            title: 'Budgets de Février 2026',
            showAdd: true,
            budgets: [
              {
                name: 'Courses',
                icon: '🛒',
                allocated: 60,
                expenses: [{ icon: '💰', desc: 'Supermarché', amount: 8, taken: true }],
              },
            ],
          },
        ],
      },
      {
        id: 'c',
        isoDate: '2026-03-01T00:00:00.000Z',
        displayLabel: 'Mars 2026',
        currentBalance: 30,
        projectedBalance: 3,
        budgetGroups: [
          {
            title: 'Budgets de Mars 2026',
            showAdd: true,
            budgets: [
              {
                name: 'Sport',
                icon: '💪',
                allocated: 70,
                expenses: [{ icon: '💰', desc: 'Salle', amount: 9, taken: false }],
              },
            ],
          },
        ],
      },
    ];
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months }),
    });
    await waitFor(() => {
      expect(within(recap()).getByText('Janvier 2026')).toBeTruthy();
    });
    const r0 = within(recap());
    expect(r0.getByRole('button', { name: formatEuros(10) })).toBeTruthy();
    expect(r0.getByText(formatEuros(1))).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Loisirs/, level: 2 })).toBeTruthy();

    const moisSuivant = screen.getByRole('button', { name: 'Mois suivant' });
    const moisPrecedent = screen.getByRole('button', { name: 'Mois précédent' });
    expect((moisPrecedent as HTMLButtonElement).disabled).toBe(true);
    expect((moisSuivant as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(moisSuivant);
    await waitFor(() => {
      expect(within(recap()).getByText('Février 2026')).toBeTruthy();
    });
    const r1 = within(recap());
    expect(r1.getByRole('button', { name: formatEuros(20) })).toBeTruthy();
    expect(r1.getByText(formatEuros(2))).toBeTruthy();
    expect((screen.getByRole('checkbox', { name: /Supermarché/ }) as HTMLInputElement).checked).toBe(true);

    fireEvent.click(moisSuivant);
    await waitFor(() => {
      expect(within(recap()).getByText('Mars 2026')).toBeTruthy();
    });
    expect(within(recap()).getByRole('button', { name: formatEuros(30) })).toBeTruthy();
    expect((moisSuivant as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(moisPrecedent);
    await waitFor(() => {
      expect(within(recap()).getByText('Février 2026')).toBeTruthy();
    });
    expect(within(recap()).getByRole('button', { name: formatEuros(20) })).toBeTruthy();
  });
});
