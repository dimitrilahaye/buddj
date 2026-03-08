import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';

describe('home quand l’utilisateur n’est pas authentifié', () => {
  it('reste sur / et affiche le titre Welcome on Buddj!', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');
    (window as Window & { __INJECT_AUTH_SERVICE__?: ReturnType<typeof createAuthServiceFromInMemory> }).__INJECT_AUTH_SERVICE__ =
      createAuthServiceFromInMemory(false);

    await import('../../src/main.js');

    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome on Buddj!' })).exist;
  });
});
