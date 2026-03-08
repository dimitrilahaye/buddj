import { Store } from '../store.js';
import { DEFAULT_AUTH_STATE, type AuthState } from './auth-state.js';

export type CheckUserIsAuthenticatedFn = () => Promise<boolean>;

/**
 * Store auth : state AuthState, action checkUserIsAuthenticated,
 * events "isAuthenticated:loading", "isUserAuthenticatedChecked" ({ isAuthenticated }), "isAuthenticated:failure" ({ message }).
 */
export class AuthStore extends Store<AuthState> {
  constructor({
    checkUserIsAuthenticated,
    onAuthenticatedRedirect,
  }: {
    checkUserIsAuthenticated: CheckUserIsAuthenticatedFn;
    onAuthenticatedRedirect?: () => void;
  }) {
    super(DEFAULT_AUTH_STATE);
    this.addEventListener('checkUserIsAuthenticated', () => this.handleCheckUserIsAuthenticated());
    this._checkUserIsAuthenticated = checkUserIsAuthenticated;
    this._onAuthenticatedRedirect = onAuthenticatedRedirect;
  }

  private _checkUserIsAuthenticated: CheckUserIsAuthenticatedFn;
  private _onAuthenticatedRedirect?: () => void;

  private async handleCheckUserIsAuthenticated(): Promise<void> {
    this.setState({ isLoading: true });
    this.emitStateChange('isAuthenticated:loading');
    try {
      const isAuthenticated = await this._checkUserIsAuthenticated();
      this.setState({ isAuthenticated, isLoading: false });
      if (isAuthenticated && this._onAuthenticatedRedirect) {
        this._onAuthenticatedRedirect();
      }
      this.emitStateChange('isUserAuthenticatedChecked', { isAuthenticated });
    } catch (err) {
      this.setState({ isLoading: false });
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('isAuthenticated:failure', { message });
    }
  }
}
