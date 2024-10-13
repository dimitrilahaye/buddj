import {
  HttpErrorResponse,
  HttpHeaders,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { HotToastService } from '@ngxpert/hot-toast';

export const httpRequestsInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(HotToastService);

  const headers = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });

  const newReq = req.clone({
    withCredentials: true,
    headers,
  });

  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = error?.error?.message || 'An unknown error occurred';

      if (error.status === 401) {
        toaster.error("Vous n'êtes pas connectés");
      } else {
        toaster.error(errorMessage);
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
