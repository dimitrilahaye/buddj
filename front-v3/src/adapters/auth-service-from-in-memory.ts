import type { AuthService } from '../application/auth/auth-service.js';

/**
 * Implémentation in-memory du port AuthService (tests / démo).
 */
export function createAuthServiceFromInMemory(result: boolean): AuthService {
  return {
    login(): void {
      // No-op en test / démo
    },
    async isAuthenticated(): Promise<boolean> {
      await new Promise((r) => setTimeout(r, 100));
      return result;
    },
  };
}
