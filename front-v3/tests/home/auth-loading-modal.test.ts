import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import type { AuthService } from '../../src/application/auth/auth-service.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

/** AuthService qui résout après un délai (pour garder la modal de chargement visible). */
function createDelayedAuthService(result: boolean, delayMs: number): AuthService {
  return {
    login(): void {},
    async logout(): Promise<void> {},
    async isAuthenticated(): Promise<boolean> {
      await new Promise((r) => setTimeout(r, delayMs));
      return result;
    },
  };
}

describe('modal de chargement (auth)', () => {
  it('affiche la modal "Connexion à Buddj! en cours" pendant la vérification', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');

    bootstrap({
      authService: createDelayedAuthService(false, 80),
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(screen.getByRole('status', { name: 'Connexion à Buddj! en cours' })).exist;
  });
});
