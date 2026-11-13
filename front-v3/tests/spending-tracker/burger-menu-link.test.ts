import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createSpendingTrackerServiceFromInMemory } from '../../src/adapters/spending-tracker-service-from-in-memory.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';
import { monthServiceEmpty } from '../helpers/month-service-empty.js';

describe('menu burger : suivi des dépenses', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('est le premier lien du menu, dans sa propre section, et ouvre l’écran', async () => {
    document.body.innerHTML = `
      <buddj-toast></buddj-toast>
      <buddj-burger-panel id="burger-panel"></buddj-burger-panel>
      <main id="screen-outlet" role="main"></main>
    `;
    window.history.replaceState(null, '', '/budgets');
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: monthServiceEmpty,
      spendingTrackerService: createSpendingTrackerServiceFromInMemory(),
    });
    await screen.findByText('Aucun mois à afficher pour le moment.');
    const menu = screen.getByRole('dialog', { name: 'Menu' });

    const [firstSection] = within(menu).getAllByRole('list');
    expect(within(firstSection!).getAllByRole('link').map((a) => a.textContent)).toEqual(['Suivi des dépenses']);

    fireEvent.click(within(menu).getByRole('link', { name: 'Suivi des dépenses' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Suivi des dépenses', level: 1 })).toBeTruthy();
    });
    expect(window.location.pathname).toBe('/spending-tracker');
  });
});
