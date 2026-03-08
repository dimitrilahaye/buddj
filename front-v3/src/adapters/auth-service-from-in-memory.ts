import type { AuthService } from '../application/auth/auth-service.js';

/**
 * Implémentation in-memory du port AuthService (tests / démo).
 */
export function createAuthServiceFromInMemory(result: boolean): AuthService {
  return {
    async isAuthenticated(): Promise<boolean> {
      await new Promise((r) => setTimeout(r, 100));
      // throw new Error('test');
      return result;
    },
  };
}
