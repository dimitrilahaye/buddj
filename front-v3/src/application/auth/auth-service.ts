/**
 * Port auth : vérification d’authentification et login (redirection OAuth).
 */
export interface AuthService {
  isAuthenticated(): Promise<boolean>;
  login(): void;
}
