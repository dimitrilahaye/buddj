import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { ButtonOldComponent } from './button-old.component';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<ButtonOldComponent> = {
  title: 'Example/Button-old',
  component: ButtonOldComponent,
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: {
      control: 'color',
    },
  },
  // Use `fn` to spy on the handleClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { handleClick: fn() },
};

export default meta;
type Story = StoryObj<ButtonOldComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  tags: ['!autodocs'],
  args: {
    primary: true,
    size: 'large',
    label: 'Button',
  },
};

export const Secondary: Story = {
  tags: ['!autodocs'],
  args: {
    label: 'Button',
  },
};

export const Large: Story = {
  tags: ['!autodocs'],
  args: {
    size: 'large',
    label: 'Button',
  },
};

export const Small: Story = {
  tags: ['!autodocs'],
  args: {
    size: 'small',
    label: 'Button',
  },
};
