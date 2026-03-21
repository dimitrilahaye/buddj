import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';
import { monthServiceEmpty } from '../helpers/month-service-empty.js';

describe("home quand l'utilisateur n'est pas authentifié", () => {
  it('reste sur / et affiche le titre Welcome on Buddj!', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');

    bootstrap({ authService: createAuthServiceFromInMemory(false), monthService: monthServiceEmpty });

    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome on Buddj!' })).exist;
  });

  it('masque la modal de chargement une fois la vérification terminée', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');

    bootstrap({ authService: createAuthServiceFromInMemory(false), monthService: monthServiceEmpty });

    await new Promise((r) => setTimeout(r, 150));

    expect(screen.queryByRole('status', { name: 'Connexion à Buddj! en cours' })).toBeNull();
  });
});
