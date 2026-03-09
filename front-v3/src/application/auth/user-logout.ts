import type { AuthService } from './auth-service.js';

export type UserLogoutFn = () => Promise<void>;

/**
 * Use case : appelle le logout côté port AuthService (GET /auth/logout).
 */
export function userLogout({ authService }: { authService: AuthService }): Promise<void> {
  return authService.logout();
}
