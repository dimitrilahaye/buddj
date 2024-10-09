import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  label = input.required<string>();
  type = input<string>('button');
  size = input<'big' | 'middle'>('middle');
  variant = input<'default' | 'danger'>('default');
  click = output();

  get className() {
    return `button button--${this.size()} button--${this.variant()}`;
  }

  onClick() {
    this.click.emit();
  }
}
