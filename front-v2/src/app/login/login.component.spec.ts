import { render, screen } from '@testing-library/angular';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  describe('When we click on login button', () => {
    it('should call login method', async () => {
      const loginSpy = jasmine.createSpy();
      await render(LoginComponent, {
        on: {
          login: loginSpy,
        },
      });
      const loginButton = screen.getByRole('button', { name: 'Login' });
      loginButton.click();
      expect(loginSpy).toHaveBeenCalled();
    });
  });
});
