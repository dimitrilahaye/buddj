import { ButtonComponent } from './button.component';
import { render, screen } from '@testing-library/angular';

describe('ButtonComponent', () => {
  it('should call login output on click', async () => {
    const loginSpy = jasmine.createSpy();
    await render(ButtonComponent, {
      inputs: {
        label: 'My button',
      },
      on: {
        login: loginSpy,
      },
    });

    const button = screen.getByRole('button', { name: 'My button' });
    button.click();
    expect(loginSpy).toHaveBeenCalled();
  });
});
