import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationServiceInterface } from './authentication.service.interface';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService implements AuthenticationServiceInterface {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  login(): void {
    window.open(`${this.apiUrl}/auth/google`, '_self');
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/me`).pipe(
      map((user) => !!user),
      catchError(() => {
        return of(false);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/auth/logout`);
  }
}
