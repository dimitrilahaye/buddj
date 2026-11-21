/**
 * « Suivi des épargnes » (menu burger) via bootstrap + service in-memory.
 * Aujourd'hui est figé au samedi 21 novembre 2026.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/dom';
import { LIVRET_A, startOn } from './helpers.js';
import { createSavingsAccountServiceFromInMemory } from '../../src/adapters/savings-account-service-from-in-memory.js';

function total(label: string): string {
  return screen.getByRole('group', { name: new RegExp(`^${label} : `) }).getAttribute('aria-label') ?? '';
}

describe('suivi des épargnes', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 10, 21, 10, 0) });
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  it('est au-dessus de « Suivi des dépenses » dans le menu et s’ouvre sur « Ce mois »', async () => {
    const service = startOn({ path: '/savings-accounts' });
    await screen.findByRole('heading', { name: 'Livret A Crédit Agricole' });
    const menu = screen.getByRole('dialog', { name: 'Menu' });
    const [firstSection] = within(menu).getAllByRole('list');
    expect(within(firstSection!).getAllByRole('link').map((a) => a.textContent)).toEqual([
      'Suivi des épargnes',
      'Suivi des dépenses',
    ]);

    fireEvent.click(within(menu).getByRole('link', { name: 'Suivi des épargnes' }));

    await screen.findByRole('heading', { name: 'Suivi des épargnes', level: 1 });
    expect(window.location.pathname).toBe('/savings-tracker');
    expect((screen.getByRole('radio', { name: 'Ce mois' }) as HTMLInputElement).checked).toBe(true);
    await waitFor(() => expect(total('Ajouté')).toBe('Ajouté : + 150,00 €'));
    expect(total('Retiré')).toBe('Retiré : − 300,00 €');
    expect(total('Net sur la période')).toBe('Net sur la période : − 150,00 €');
    expect(total('Solde en fin de période')).toBe('Solde en fin de période : 4850,00 €');
    expect(service.trackerCalls.at(-1)).toEqual({ savingsAccountId: 'livret-a', from: '2026-11-01', to: '2026-11-21' });
  });

  it('recalcule sur une plage choisie au calendrier et en changeant de compte', async () => {
    const service = startOn({ path: '/savings-tracker' });
    await waitFor(() => expect(total('Ajouté')).toBe('Ajouté : + 150,00 €'));

    fireEvent.click(screen.getByRole('button', { name: /^Dates : / }));
    const picker = screen.getByRole('dialog', { name: 'Choisir une période' });
    fireEvent.click(within(picker).getByRole('button', { name: 'Mois précédent' }));
    fireEvent.click(within(picker).getByRole('button', { name: 'jeudi 1 octobre 2026' }));
    fireEvent.click(within(picker).getByRole('button', { name: 'Mois suivant' }));
    fireEvent.click(within(picker).getByRole('button', { name: 'samedi 21 novembre 2026' }));
    fireEvent.click(within(picker).getByRole('button', { name: 'Valider' }));

    await waitFor(() => expect(total('Ajouté')).toBe('Ajouté : + 5150,00 €'));
    expect((screen.getByRole('radio', { name: 'Ce mois' }) as HTMLInputElement).checked).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Compte épargne suivant' }));
    await screen.findByRole('heading', { name: 'LDDS' });
    await waitFor(() => expect(total('Solde en fin de période')).toBe('Solde en fin de période : 1200,00 €'));
    expect(total('Ajouté')).toBe('Ajouté : + 0,00 €');
    expect(service.trackerCalls.at(-1)).toEqual({ savingsAccountId: 'ldds', from: '2026-10-01', to: '2026-11-21' });
  });

  it('trace solde, ajouts et retraits cumulés et met une courbe en avant au clic sur la légende', async () => {
    startOn({ path: '/savings-tracker' });
    const legend = await screen.findByRole('list', { name: 'Courbes' });
    await waitFor(() =>
      expect(within(legend).getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
        'Solde : 4850,00 €',
        'Ajouts cumulés : 150,00 €',
        'Retraits cumulés : 300,00 €',
      ])
    );

    fireEvent.click(within(legend).getByRole('button', { name: 'Retraits cumulés : 300,00 €' }));
    expect(within(legend).getByRole('button', { name: 'Retraits cumulés : 300,00 €' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(legend).getByRole('button', { name: 'Solde : 4850,00 €' }).getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(within(legend).getByRole('button', { name: 'Retraits cumulés : 300,00 €' }));
    expect(within(legend).getByRole('button', { name: 'Retraits cumulés : 300,00 €' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('affiche une erreur quand le suivi ne se charge pas', async () => {
    const service = createSavingsAccountServiceFromInMemory({ accounts: [LIVRET_A] });
    service.getTracker = () => Promise.reject(new Error('serveur indisponible'));
    startOn({ path: '/savings-tracker', service });

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByRole('list', { name: 'Courbes' })).toBeNull();
  });
});
