import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { ButtonComponent } from '../../../app/design-system/button/button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Elements/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  args: { login: fn() },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Default: Story = {
  args: {
    label: 'Default Button',
  },
};
