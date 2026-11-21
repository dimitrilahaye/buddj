/**
 * Lien « Épargnes » de la navigation principale (fichier dédié : part d'un autre onglet).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/dom';
import { startOn } from './helpers.js';

describe('navigation : onglet Épargnes', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('suit Charges et Budgets et ouvre l’onglet, actif dans la navigation', async () => {
    startOn({ path: '/budgets' });
    // Attendre la fin de la vérification de session : elle renvoie sur l'écran demandé.
    await screen.findByText('Aucun mois à afficher pour le moment.');
    const nav = screen
      .getAllByRole('navigation')
      .find((n) => within(n).queryByRole('link', { name: 'Charges' })) as HTMLElement;
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual(['Charges', 'Budgets', 'Épargnes']);

    fireEvent.click(within(nav).getByRole('link', { name: 'Épargnes' }));

    await screen.findByRole('heading', { name: 'Livret A Crédit Agricole' });
    expect(window.location.pathname).toBe('/savings-accounts');
    expect(within(nav).getByRole('link', { name: 'Épargnes' }).classList.contains('nav-link--active')).toBe(true);
  });
});
