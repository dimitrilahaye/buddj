import { render, screen } from '@testing-library/angular';
import { LoginComponent } from './login.component';
import { AUTHENTICATION_SERVICE } from '../services/authentication/authentication.interface';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../services/authentication/authentication.service';

describe('LoginComponent', () => {
  describe('When we click on login button', () => {
    it('should call login method', async () => {
      const spy = jasmine.createSpyObj('AuthenticationService', ['login']);
      await render(LoginComponent, {
        providers: [{ provide: AUTHENTICATION_SERVICE, useValue: spy }],
      });
      const authenticationServiceSpy = TestBed.inject(
        AUTHENTICATION_SERVICE
      ) as jasmine.SpyObj<AuthenticationService>;
      const loginButton = screen.getByRole('button', { name: 'Login' });
      loginButton.click();
      expect(authenticationServiceSpy.login).toHaveBeenCalled();
    });
  });
});
