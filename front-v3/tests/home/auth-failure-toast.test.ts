import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/dom';
import type { AuthService } from '../../src/application/auth/auth-service.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

/** AuthService qui rejette avec un message (simule une erreur API). */
function createFailingAuthService(message: string): AuthService {
  return {
    login(): void {},
    async isAuthenticated(): Promise<boolean> {
      throw new Error(message);
    },
  };
}

describe('toast d’erreur quand la vérification auth échoue', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('en cas d’erreur API : modal de loading disparaît, toast erreur apparaît, on reste sur /', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main><buddj-toast></buddj-toast>';
    window.history.replaceState(null, '', '/');

    const errorMessage = 'Erreur serveur.';
    bootstrap({ authService: createFailingAuthService(errorMessage) });

    await new Promise((r) => setTimeout(r, 150));

    expect(screen.queryByRole('status', { name: 'Connexion à Buddj! en cours' })).toBeNull();
    expect(screen.getByRole('alert', { name: errorMessage })).exist;
    expect(window.location.pathname).toBe('/');
  });

  it('affiche un toast d’erreur quand le service renvoie 401', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main><buddj-toast></buddj-toast>';
    window.history.replaceState(null, '', '/');

    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            statusText: 'Unauthorized',
            headers: { 'Content-Type': 'application/json' },
          })
        )
      )
    );

    bootstrap({ config: { apiUrl: 'http://localhost:8080' } });

    await new Promise((r) => setTimeout(r, 150));

    const toast = screen.getByRole('alert', { name: "Vous n'êtes pas connectés" });
    expect(toast).exist;
    expect(toast.textContent).toContain("Vous n'êtes pas connectés");
  });
});
