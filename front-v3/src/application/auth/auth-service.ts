/**
 * Port auth : vérification d’authentification, login (redirection OAuth) et logout.
 */
export interface AuthService {
  isAuthenticated(): Promise<boolean>;
  login(): void;
  logout(): Promise<void>;
}
