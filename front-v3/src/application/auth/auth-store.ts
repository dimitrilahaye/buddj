import { DEFAULT_AUTH_STATE, type AuthState } from './auth-state.js';

export type CheckUserIsAuthenticatedFn = () => Promise<boolean>;

/**
 * Store auth : étend EventTarget, state AuthState, action checkUserIsAuthenticated,
 * event "isAuthenticated:loading" pendant la vérification.
 */
export class AuthStore extends EventTarget {
  private state: AuthState = { ...DEFAULT_AUTH_STATE };

  constructor({
    checkUserIsAuthenticated,
    onAuthenticatedRedirect,
  }: {
    checkUserIsAuthenticated: CheckUserIsAuthenticatedFn;
    onAuthenticatedRedirect?: () => void;
  }) {
    super();
    this.addEventListener('checkUserIsAuthenticated', () => this.handleCheckUserIsAuthenticated());
    this._checkUserIsAuthenticated = checkUserIsAuthenticated;
    this._onAuthenticatedRedirect = onAuthenticatedRedirect;
  }

  private _checkUserIsAuthenticated: CheckUserIsAuthenticatedFn;
  private _onAuthenticatedRedirect?: () => void;

  getState(): AuthState {
    return { ...this.state };
  }

  setState(partial: Partial<AuthState>): void {
    this.state = { ...this.state, ...partial };
  }

  /**
   * Émet un event d’état (store → WC). Payload minimal dans detail.
   */
  emitStateChange<T>(name: string, detail?: T): void {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  /**
   * Helper pour les WC : envoie une action au store (synchrone).
   */
  emitAction(name: string, payload?: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail: payload }));
  }

  private async handleCheckUserIsAuthenticated(): Promise<void> {
    this.setState({ isLoading: true });
    this.emitStateChange('isAuthenticated:loading');
    try {
      const isAuthenticated = await this._checkUserIsAuthenticated();
      this.setState({ isAuthenticated, isLoading: false });
      if (isAuthenticated && this._onAuthenticatedRedirect) {
        this._onAuthenticatedRedirect();
      }
    } catch {
      this.setState({ isLoading: false });
    }
  }
}
