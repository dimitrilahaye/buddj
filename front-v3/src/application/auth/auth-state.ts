/**
 * State du slice auth.
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const DEFAULT_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  isLoading: false,
};
