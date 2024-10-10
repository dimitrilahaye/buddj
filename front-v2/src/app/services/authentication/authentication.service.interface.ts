import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuthenticationServiceInterface {
  login(): void;
  isAuthenticated(): Observable<boolean>;
}

export const AUTHENTICATION_SERVICE =
  new InjectionToken<AuthenticationServiceInterface>('AUTHENTICATION_SERVICE');
