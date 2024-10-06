import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {
  AUTHENTICATION_SERVICE,
  AuthenticationServiceInterface,
} from '../services/authentication/authentication.interface';
import { catchError, map, Observable, of } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const auth: AuthenticationServiceInterface = inject(AUTHENTICATION_SERVICE);
  const router = inject(Router);

  return auth.isAuthenticated().pipe(
    map((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
