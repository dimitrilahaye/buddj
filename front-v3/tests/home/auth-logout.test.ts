import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/dom';
import type { AuthService } from '../../src/application/auth/auth-service.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

/** AuthService authentifié : isAuthenticated true, logout() ne résout jamais (pour garder la modal visible). */
function createAuthServiceWithPendingLogout(): AuthService {
  return {
    login(): void {},
    async logout(): Promise<void> {
      await new Promise(() => {});
    },
    async isAuthenticated(): Promise<boolean> {
      return true;
    },
  };
}

/** AuthService authentifié : logout() throw (pour tester askForLogout:failure). */
function createAuthServiceWithFailingLogout(errorMessage: string): AuthService {
  return {
    login(): void {},
    async logout(): Promise<void> {
      throw new Error(errorMessage);
    },
    async isAuthenticated(): Promise<boolean> {
      return true;
    },
  };
}

/** AuthService authentifié : logout() résout (pour tester redirection). */
function createAuthServiceWithSuccessLogout(): AuthService {
  return {
    login(): void {},
    async logout(): Promise<void> {},
    async isAuthenticated(): Promise<boolean> {
      return true;
    },
  };
}

async function waitForRedirectToBudgets(): Promise<void> {
  await new Promise((r) => setTimeout(r, 150));
}

describe('logout (menu burger)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('affiche la modal de loading au clic sur Se déconnecter', async () => {
    document.body.innerHTML =
      '<main id="screen-outlet" role="main"></main><buddj-nav></buddj-nav><buddj-burger-panel id="burger-panel"></buddj-burger-panel><buddj-toast></buddj-toast>';
    window.history.replaceState(null, '', '/');

    bootstrap({ authService: createAuthServiceWithPendingLogout() });
    await waitForRedirectToBudgets();

    screen.getByRole('button', { name: 'Ouvrir le menu' }).click();
    await new Promise((r) => setTimeout(r, 20));

    const logoutBtn = screen.getByRole('button', { name: 'Se déconnecter' });
    logoutBtn.click();

    await new Promise((r) => setTimeout(r, 50));

    expect(screen.getByRole('status', { name: 'Déconnexion en cours' })).exist;
  });

  it('en cas d’erreur : toast d’erreur, modal loading disparue, on reste sur la même page', async () => {
    document.body.innerHTML =
      '<main id="screen-outlet" role="main"></main><buddj-nav></buddj-nav><buddj-burger-panel id="burger-panel"></buddj-burger-panel><buddj-toast></buddj-toast>';
    window.history.replaceState(null, '', '/');

    const errorMessage = 'Erreur serveur lors de la déconnexion.';
    bootstrap({ authService: createAuthServiceWithFailingLogout(errorMessage) });
    await waitForRedirectToBudgets();

    const currentPath = window.location.pathname;
    screen.getByRole('button', { name: 'Ouvrir le menu' }).click();
    await new Promise((r) => setTimeout(r, 20));

    const logoutBtn = screen.getByRole('button', { name: 'Se déconnecter' });
    logoutBtn.click();

    await new Promise((r) => setTimeout(r, 100));

    expect(screen.queryByRole('status', { name: 'Déconnexion en cours' })).toBeNull();
    expect(screen.getByRole('alert', { name: errorMessage })).exist;
    expect(window.location.pathname).toBe(currentPath);
  });

  it('en cas de succès, redirige vers /', async () => {
    document.body.innerHTML =
      '<main id="screen-outlet" role="main"></main><buddj-nav></buddj-nav><buddj-burger-panel id="burger-panel"></buddj-burger-panel><buddj-toast></buddj-toast>';
    window.history.replaceState(null, '', '/');

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    bootstrap({ authService: createAuthServiceWithSuccessLogout() });
    await waitForRedirectToBudgets();

    replaceStateSpy.mockClear();

    screen.getByRole('button', { name: 'Ouvrir le menu' }).click();
    await new Promise((r) => setTimeout(r, 20));

    const logoutBtn = screen.getByRole('button', { name: 'Se déconnecter' });
    logoutBtn.click();

    await new Promise((r) => setTimeout(r, 150));

    expect(screen.queryByRole('status', { name: 'Déconnexion en cours' })).toBeNull();
    // Le store appelle onLogoutSuccess qui fait router.replace('/')
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
  });
});
