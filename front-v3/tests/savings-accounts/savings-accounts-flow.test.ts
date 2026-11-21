/**
 * Onglet « Épargnes » via bootstrap + service in-memory. Aujourd'hui est figé au 21 novembre 2026.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/dom';
import { createSavingsAccountServiceFromInMemory } from '../../src/adapters/savings-account-service-from-in-memory.js';
import { clickLineMenuAction } from '../helpers/line-menu.js';
import { LIVRET_A, startOn, typeAmount } from './helpers.js';

function balance(): string {
  return screen.getByLabelText(/^Solde : /).getAttribute('aria-label') ?? '';
}

function operationsList(): HTMLElement {
  return screen.getByRole('region', { name: /^Opérations : / });
}

describe('onglet Épargnes', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 10, 21, 10, 0) });
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  it('affiche le solde et les opérations par jour, de la plus récente à la plus ancienne', async () => {
    startOn({ path: '/savings-accounts' });
    await screen.findByRole('heading', { name: 'Livret A Crédit Agricole' });
    expect(balance()).toBe('Solde : 4850,00 €');

    const days = within(operationsList()).getAllByRole('region');
    expect(days.map((d) => d.getAttribute('aria-label'))).toEqual([
      'mar. 10 nov. 2026',
      'lun. 2 nov. 2026',
      'jeu. 1 oct. 2026',
    ]);
    expect(within(days[0]!).getByRole('listitem', { name: 'Trou de trésorerie : − 300,00 €' })).toBeTruthy();
    // Sans libellé, la ligne porte le type
    expect(within(days[1]!).getByRole('listitem', { name: 'Ajout : + 150,00 €' })).toBeTruthy();
  });

  it('passe d’un compte épargne à l’autre avec les flèches', async () => {
    startOn({ path: '/savings-accounts' });
    await screen.findByRole('heading', { name: 'Livret A Crédit Agricole' });
    expect((screen.getByRole('button', { name: 'Compte épargne précédent' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Compte épargne suivant' }));

    await screen.findByRole('heading', { name: 'LDDS' });
    expect(balance()).toBe('Solde : 1200,00 €');
    expect((screen.getByRole('button', { name: 'Compte épargne suivant' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Compte épargne précédent' }));
    await screen.findByRole('heading', { name: 'Livret A Crédit Agricole' });
  });

  it('ajoute un retrait daté et recalcule le solde', async () => {
    startOn({ path: '/savings-accounts' });
    await screen.findByRole('heading', { name: 'Livret A Crédit Agricole' });

    fireEvent.click(screen.getByRole('button', { name: '+ Ajouter une opération' }));
    const drawer = screen.getByRole('dialog', { name: 'Ajouter une opération' });
    fireEvent.click(within(drawer).getByRole('radio', { name: 'Retrait' }));
    fireEvent.input(within(drawer).getByRole('textbox', { name: 'Libellé de l’opération' }), {
      target: { value: 'Réparation voiture' },
    });
    fireEvent.click(within(drawer).getByRole('button', { name: /^Montant/ }));
    await typeAmount(['4', '2']);
    expect(within(drawer).getByRole('button', { name: 'Date : sam. 21 nov. 2026' })).toBeTruthy();

    fireEvent.click(within(drawer).getByRole('button', { name: 'Date : sam. 21 nov. 2026' }));
    const picker = screen.getByRole('dialog', { name: 'Choisir une date' });
    fireEvent.click(within(picker).getByRole('button', { name: 'vendredi 20 novembre 2026' }));
    fireEvent.click(within(picker).getByRole('button', { name: 'Valider' }));
    fireEvent.click(within(drawer).getByRole('button', { name: 'Valider' }));

    await waitFor(() => expect(balance()).toBe('Solde : 4808,00 €'));
    const day = within(operationsList()).getByRole('region', { name: 'ven. 20 nov. 2026' });
    expect(within(day).getByRole('listitem', { name: 'Réparation voiture : − 42,00 €' })).toBeTruthy();
  });

  it('modifie une opération puis en supprime une, le solde suit', async () => {
    startOn({ path: '/savings-accounts' });
    await screen.findByRole('heading', { name: 'Livret A Crédit Agricole' });

    clickLineMenuAction(screen.getByRole('listitem', { name: 'Trou de trésorerie : − 300,00 €' }), 'edit');
    const drawer = screen.getByRole('dialog', { name: 'Modifier l’opération' });
    expect((within(drawer).getByRole('radio', { name: 'Retrait' }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(within(drawer).getByRole('button', { name: /^Montant/ }));
    await typeAmount(['2', '0', '0']);
    fireEvent.click(within(drawer).getByRole('button', { name: 'Valider' }));
    await waitFor(() => expect(balance()).toBe('Solde : 4950,00 €'));

    clickLineMenuAction(screen.getByRole('listitem', { name: 'Trou de trésorerie : − 200,00 €' }), 'delete');
    const modal = screen.getByRole('dialog', { name: 'Supprimer l’opération « Trou de trésorerie » ?' });
    fireEvent.click(within(modal).getByRole('button', { name: 'Supprimer' }));

    await waitFor(() => expect(balance()).toBe('Solde : 5150,00 €'));
    expect(screen.queryByRole('listitem', { name: /^Trou de trésorerie/ })).toBeNull();
  });

  it('signale l’échec d’un ajout sans toucher au solde', async () => {
    startOn({
      path: '/savings-accounts',
      service: createSavingsAccountServiceFromInMemory({ accounts: [LIVRET_A], failWith: 'serveur indisponible' }),
    });
    await screen.findByRole('heading', { name: 'Livret A Crédit Agricole' });

    fireEvent.click(screen.getByRole('button', { name: '+ Ajouter une opération' }));
    const drawer = screen.getByRole('dialog', { name: 'Ajouter une opération' });
    fireEvent.click(within(drawer).getByRole('button', { name: /^Montant/ }));
    await typeAmount(['1', '0']);
    fireEvent.click(within(drawer).getByRole('button', { name: 'Valider' }));

    await screen.findByText('Impossible d’ajouter l’opération');
    expect(balance()).toBe('Solde : 4850,00 €');
  });

  it('refuse une opération sans montant', async () => {
    startOn({ path: '/savings-accounts' });
    await screen.findByRole('heading', { name: 'Livret A Crédit Agricole' });

    fireEvent.click(screen.getByRole('button', { name: '+ Ajouter une opération' }));
    const drawer = screen.getByRole('dialog', { name: 'Ajouter une opération' });
    fireEvent.click(within(drawer).getByRole('button', { name: 'Valider' }));

    await screen.findByText('Le montant doit être supérieur à 0');
    expect(screen.getByRole('dialog', { name: 'Ajouter une opération' })).toBeTruthy();
  });
});
