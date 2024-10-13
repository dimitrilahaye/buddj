import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuthenticationServiceInterface {
  login(): void;
  isAuthenticated(): Observable<boolean>;
  logout(): Observable<void>;
}

export const AUTHENTICATION_SERVICE =
  new InjectionToken<AuthenticationServiceInterface>('AUTHENTICATION_SERVICE');
