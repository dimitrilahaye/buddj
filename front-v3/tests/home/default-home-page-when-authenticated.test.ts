import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { DEFAULT_MONTH_ID } from '../../src/router-config.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

describe("home quand l'utilisateur est authentifié", () => {
  it('redirige vers /budgets/:monthId et masque la modal de chargement', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');

    bootstrap({ authService: createAuthServiceFromInMemory(true) });

    await new Promise((r) => setTimeout(r, 100));

    expect(window.location.pathname).toBe(`/budgets/${DEFAULT_MONTH_ID}`);
    expect(screen.queryByRole('status', { name: 'Connexion à Buddj! en cours' })).toBeNull();
  });
});
