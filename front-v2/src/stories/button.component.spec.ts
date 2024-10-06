import { render, screen } from '@testing-library/angular';
import { composeStories, createMountable } from '@storybook/testing-angular';

import * as stories from './button-old.stories';
const { Primary } = composeStories(stories);

describe('ButtonComponent', function () {
  describe('primary and large', function () {
    const handleClickSpy = jasmine.createSpy();
    beforeEach(async () => {
      const { component, applicationConfig } = createMountable(
        Primary({
          handleClick: handleClickSpy,
        })
      );
      await render(component, {
        componentProperties: { ...Primary.args },
        providers: applicationConfig.providers,
      });
    });

    it('should have primary and large classes', () => {
      const button = screen.getByRole('button', { name: 'Button' });
      button.click();
      expect(button).toHaveClass('storybook-button--primary');
      expect(button).toHaveClass('storybook-button--large');
      expect(handleClickSpy).toHaveBeenCalled();
    });
  });
});
