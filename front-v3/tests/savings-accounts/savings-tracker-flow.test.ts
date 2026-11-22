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
    // Seul raccourci : « Ce mois » ; le reste passe par le calendrier.
    const period = screen.getByRole('group', { name: 'Période' });
    expect(within(period).getAllByRole('radio').map((r) => r.closest('label')?.textContent?.trim())).toEqual(['Ce mois']);
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

  it('trace une seule courbe du solde et détaille les mouvements dans l’infobulle', async () => {
    startOn({ path: '/savings-tracker' });
    const plot = await screen.findByRole('group', { name: /^Solde : 4850,00 € au / });
    expect(screen.queryByRole('list', { name: 'Courbes' })).toBeNull();
    expect(document.querySelectorAll('.savings-chart-line')).toHaveLength(1);
    // Un point par jour avec mouvement : l'ajout du 2 et le retrait du 10 novembre.
    expect(document.querySelectorAll('.savings-chart-movement')).toHaveLength(2);

    fireEvent.keyDown(plot, { key: 'ArrowLeft' });
    const tooltip = within(plot).getByRole('status', { name: 'Valeurs de la période survolée' });
    expect(tooltip.textContent).toContain('4850,00 € de solde');
    expect(tooltip.textContent).not.toContain('retirés');

    // Du 21 au 10 novembre : le jour du retrait.
    for (let i = 0; i < 11; i++) fireEvent.keyDown(plot, { key: 'ArrowLeft' });
    expect(tooltip.textContent).toContain('4850,00 € de solde');
    expect(tooltip.textContent).toContain('− 300,00 € retirés');
    expect(tooltip.textContent).not.toContain('ajoutés');
  });

  it('affiche une erreur quand le suivi ne se charge pas', async () => {
    const service = createSavingsAccountServiceFromInMemory({ accounts: [LIVRET_A] });
    service.getTracker = () => Promise.reject(new Error('serveur indisponible'));
    startOn({ path: '/savings-tracker', service });

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByRole('group', { name: /^Solde : / })).toBeNull();
  });
});
