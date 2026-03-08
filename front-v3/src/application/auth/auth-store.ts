import { Store } from '../store.js';
import { DEFAULT_AUTH_STATE, type AuthState } from './auth-state.js';
import type { UserSignInFn } from './user-sign-in.js';

export type CheckUserIsAuthenticatedFn = () => Promise<boolean>;

/**
 * Store auth : state AuthState, actions checkUserIsAuthenticated / userSignIn,
 * events "isAuthenticated:loading", "isUserAuthenticatedChecked" ({ isAuthenticated }), "isAuthenticated:failure" ({ message }),
 * "userSignIn:failure" ({ message }).
 */
export class AuthStore extends Store<AuthState> {
  constructor({
    checkUserIsAuthenticated,
    userSignIn: userSignInFn,
    onAuthenticatedRedirect,
  }: {
    checkUserIsAuthenticated: CheckUserIsAuthenticatedFn;
    userSignIn: UserSignInFn;
    onAuthenticatedRedirect?: () => void;
  }) {
    super(DEFAULT_AUTH_STATE);
    this.addEventListener('checkUserIsAuthenticated', () => this.handleCheckUserIsAuthenticated());
    this.addEventListener('userSignIn', () => this.handleUserSignIn());
    this._checkUserIsAuthenticated = checkUserIsAuthenticated;
    this._userSignIn = userSignInFn;
    this._onAuthenticatedRedirect = onAuthenticatedRedirect;
  }

  private _checkUserIsAuthenticated: CheckUserIsAuthenticatedFn;
  private _userSignIn: UserSignInFn;
  private _onAuthenticatedRedirect?: () => void;

  private handleUserSignIn(): void {
    try {
      this._userSignIn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('userSignIn:failure', { message });
    }
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
      this.emitStateChange('isUserAuthenticatedChecked', { isAuthenticated });
    } catch (err) {
      this.setState({ isLoading: false });
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('isAuthenticated:failure', { message });
    }
  }
}
