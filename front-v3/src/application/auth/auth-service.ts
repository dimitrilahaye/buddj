/**
 * Port pour vérifier si l’utilisateur est authentifié.
 */
export interface AuthService {
  isAuthenticated(): Promise<boolean>;
}
