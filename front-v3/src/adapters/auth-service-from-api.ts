/**
 * Implémentation réelle du port AuthService : GET ${apiUrl}/me avec credentials.
 * Utilise la config (apiUrl) injectée au constructeur.
 */
import type { AuthService } from '../application/auth/auth-service.js';
import { handleHttpError, handleNotOkResponse } from '../shared/http-error.js';

export function createAuthServiceFromApi({ apiUrl }: { apiUrl: string }): AuthService {
  const baseUrl = apiUrl.replace(/\/$/, '');
  return {
    login(): void {
      window.open(
        `${baseUrl}/auth/google?returnTo=${encodeURIComponent(window.location.origin)}`,
        '_self'
      );
    },
    async logout(): Promise<void> {
      const url = `${baseUrl}/auth/logout`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      return;
    },
    async isAuthenticated(): Promise<boolean> {
      const url = `${baseUrl}/me`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (response.ok) return true;
      await handleNotOkResponse(response);
      return false; // unreachable : handleNotOkResponse lance
    },
  };
}
