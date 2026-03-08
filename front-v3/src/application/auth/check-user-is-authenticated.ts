import type { AuthService } from './auth-service.js';

/**
 * Use case : interroge le port AuthService et retourne le résultat.
 */
export async function checkUserIsAuthenticated({
  authService,
}: {
  authService: AuthService;
}): Promise<boolean> {
  return authService.isAuthenticated();
}
