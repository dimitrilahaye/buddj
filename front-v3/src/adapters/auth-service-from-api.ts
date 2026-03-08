/**
 * Implémentation réelle du port AuthService : GET ${apiUrl}/me avec credentials.
 * Utilise la config (apiUrl) injectée au constructeur.
 */
import type { AuthService } from '../application/auth/auth-service.js';
import { handleHttpError } from '../shared/http-error.js';

export function createAuthServiceFromApi({ apiUrl }: { apiUrl: string }): AuthService {
  return {
    async isAuthenticated(): Promise<boolean> {
      const url = `${apiUrl.replace(/\/$/, '')}/me`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur réseau';
        return handleHttpError({ message });
      }
      if (response.ok) return true;
      let message = 'Erreur réseau';
      try {
        const body = await response.json();
        if (body && typeof body.message === 'string') message = body.message;
      } catch(e) {
        console.error('Erreur lors de la lecture du corps de la réponse', e);
      }
      handleHttpError({ status: response.status, message });
    },
  };
}
