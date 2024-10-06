import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';

import { HttpClient } from '@angular/common/http';
import { runInInjectionContext } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: spy,
        },
      ],
    });
    service = TestBed.inject(AuthenticationService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAuthenticated()', () => {
    it('should return true if api returned 200 response', fakeAsync(() => {
      httpClientSpy.get.and.returnValue(of({ status: 200 }));
      runInInjectionContext(TestBed, () => {
        let isAuthenticated: boolean | undefined;
        service
          .isAuthenticated()
          .subscribe((value) => (isAuthenticated = value));

        tick();

        expect(isAuthenticated).toBe(true);
      });
    }));

    it('should return true if api returned 401 response', fakeAsync(() => {
      httpClientSpy.get.and.returnValue(
        throwError(() => ({ status: 401, statusText: 'Unauthorized' }))
      );
      runInInjectionContext(TestBed, () => {
        let isAuthenticated: boolean | undefined;
        service
          .isAuthenticated()
          .subscribe((value) => (isAuthenticated = value));

        tick();

        expect(isAuthenticated).toBe(false);
      });
    }));
  });
});
