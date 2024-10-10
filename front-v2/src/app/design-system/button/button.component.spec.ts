import { ButtonComponent } from './button.component';
import { render, screen } from '@testing-library/angular';

describe('ButtonComponent', () => {
  it('should call login output on click', async () => {
    const clickSpy = jasmine.createSpy();
    await render(ButtonComponent, {
      inputs: {
        label: 'My button',
      },
      on: {
        click: clickSpy,
      },
    });

    const button = screen.getByRole('button', { name: 'My button' });
    button.click();
    expect(clickSpy).toHaveBeenCalled();
  });
});
