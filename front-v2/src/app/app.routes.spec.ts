import { fakeAsync, TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { RouterModule } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AuthenticationService } from './services/authentication/authentication.service';
import { routes } from './app.routes';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { AUTHENTICATION_SERVICE } from './services/authentication/authentication.service.interface';
import { Observable, of } from 'rxjs';

describe('Router Navigation with authGuard', () => {
  let router: Router;
  let authenticationServiceSpy: jasmine.SpyObj<AuthenticationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthenticationService', [
      'isAuthenticated',
    ]);
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot(routes)],
      providers: [
        HttpClient,
        HttpHandler,
        {
          provide: AUTHENTICATION_SERVICE,
          useValue: spy,
        },
      ],
    });

    router = TestBed.inject(Router);
    authenticationServiceSpy = TestBed.inject(
      AUTHENTICATION_SERVICE
    ) as jasmine.SpyObj<AuthenticationService>;
    router.initialNavigation();
  });

  describe('when navigate to /home', () => {
    describe('when no authenticated', () => {
      it('should be redirect to /login', fakeAsync(() => {
        TestBed.runInInjectionContext(async () => {
          authenticationServiceSpy.isAuthenticated.and.returnValue(of(false));

          const route: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
          const state: RouterStateSnapshot = {
            url: '/home',
          } as RouterStateSnapshot;

          const canActivate$ = (await TestBed.runInInjectionContext(() =>
            authGuard(route, state)
          )) as Observable<boolean>;

          canActivate$.subscribe((canActivate) => {
            expect(canActivate).toBeFalse();
          });

          await router.navigate(['/home']);
          expect(router.url).toEqual('/login');
        });
      }));
    });

    describe('when authenticated', () => {
      it('should be able to go to /home/outflows', fakeAsync(() => {
        TestBed.runInInjectionContext(async () => {
          authenticationServiceSpy.isAuthenticated.and.returnValue(of(true));

          const route: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
          const state: RouterStateSnapshot = {
            url: '/home',
          } as RouterStateSnapshot;

          const canActivate$ = (await TestBed.runInInjectionContext(() =>
            authGuard(route, state)
          )) as Observable<boolean>;

          canActivate$.subscribe((canActivate) => {
            expect(canActivate).toBeTrue();
          });

          await router.navigate(['/home']);
          expect(router.url).toEqual('/home/outflows');
        });
      }));
    });
  });
});
