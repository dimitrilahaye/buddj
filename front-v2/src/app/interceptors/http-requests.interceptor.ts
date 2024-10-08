import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';

export const httpRequestsInterceptor: HttpInterceptorFn = (req, next) => {
  const headers = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });

  const newReq = req.clone({
    withCredentials: true,
    headers,
  });

  return next(newReq);
};
