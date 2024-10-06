import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationServiceInterface } from './authentication.interface';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService implements AuthenticationServiceInterface {
  private cookieName: string;
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.cookieName = environment.cookieName;
    this.apiUrl = environment.apiUrl;
  }

  login(): void {
    window.open(`${this.apiUrl}/auth/google`, '_self');
  }

  isAuthenticated(): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.apiUrl}/me`, {
        withCredentials: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        map((user) => !!user),
        catchError(() => {
          return of(false);
        })
      );
  }
}
