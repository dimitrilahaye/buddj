import type { AuthService } from './auth-service.js';

export type UserSignInFn = () => void;

/**
 * Use case : déclenche le login (redirection OAuth via le port AuthService).
 */
export function userSignIn({ authService }: { authService: AuthService }): void {
  authService.login();
}
