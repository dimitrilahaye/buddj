import type { AuthService } from '../application/auth/auth-service.js';

/**
 * Implémentation in-memory du port AuthService (tests / démo).
 */
export function createAuthServiceFromInMemory(result: boolean): AuthService {
  return {
    async isAuthenticated(): Promise<boolean> {
      return result;
    },
  };
}
