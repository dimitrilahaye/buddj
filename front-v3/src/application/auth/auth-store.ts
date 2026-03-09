import { Store } from '../store.js';
import { DEFAULT_AUTH_STATE, type AuthState } from './auth-state.js';
import type { UserSignInFn } from './user-sign-in.js';
import type { UserLogoutFn } from './user-logout.js';

export type CheckUserIsAuthenticatedFn = () => Promise<boolean>;

/**
 * Store auth : state AuthState, actions checkUserIsAuthenticated / userSignIn / askForLogout,
 * events "isAuthenticated:loading", "isUserAuthenticatedChecked" ({ isAuthenticated }), "isAuthenticated:failure" ({ message }),
 * "userSignIn:failure" ({ message }), "askForLogout:loading", "askForLogout:success", "askForLogout:failure" ({ message }).
 */
export class AuthStore extends Store<AuthState> {
  constructor({
    checkUserIsAuthenticated,
    userSignIn: userSignInFn,
    userLogout: userLogoutFn,
    onAuthenticatedRedirect,
    onLogoutSuccess,
  }: {
    checkUserIsAuthenticated: CheckUserIsAuthenticatedFn;
    userSignIn: UserSignInFn;
    userLogout: UserLogoutFn;
    onAuthenticatedRedirect?: () => void;
    onLogoutSuccess?: () => void;
  }) {
    super(DEFAULT_AUTH_STATE);
    this.addEventListener('checkUserIsAuthenticated', () => this.handleCheckUserIsAuthenticated());
    this.addEventListener('userSignIn', () => this.handleUserSignIn());
    this.addEventListener('askForLogout', () => this.handleAskForLogout());
    this._checkUserIsAuthenticated = checkUserIsAuthenticated;
    this._userSignIn = userSignInFn;
    this._userLogout = userLogoutFn;
    this._onAuthenticatedRedirect = onAuthenticatedRedirect;
    this._onLogoutSuccess = onLogoutSuccess;
  }

  private _checkUserIsAuthenticated: CheckUserIsAuthenticatedFn;
  private _userSignIn: UserSignInFn;
  private _userLogout: UserLogoutFn;
  private _onAuthenticatedRedirect?: () => void;
  private _onLogoutSuccess?: () => void;

  getIsAuthenticated(): boolean {
    return this.getState().isAuthenticated;
  }

  private async handleAskForLogout(): Promise<void> {
    this.emitStateChange('askForLogout:loading');
    try {
      await this._userLogout();
      this.emitStateChange('askForLogout:success');
      this._onLogoutSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('askForLogout:failure', { message });
    }
  }

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
