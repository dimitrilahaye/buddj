import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import type { AuthService } from '../../src/application/auth/auth-service.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

/** AuthService qui rejette avec un message (simule une erreur API). */
function createFailingAuthService(message: string): AuthService {
  return {
    async isAuthenticated(): Promise<boolean> {
      throw new Error(message);
    },
  };
}

describe('toast d’erreur quand la vérification auth échoue', () => {
  it('affiche un toast d’erreur (rouge) avec le message renvoyé', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main><buddj-toast></buddj-toast>';
    window.history.replaceState(null, '', '/');

    const errorMessage = 'Erreur réseau : impossible de joindre le serveur.';
    bootstrap({ authService: createFailingAuthService(errorMessage) });

    await new Promise((r) => setTimeout(r, 100));

    expect(screen.getByRole('alert', { name: errorMessage })).exist;
  });
});
