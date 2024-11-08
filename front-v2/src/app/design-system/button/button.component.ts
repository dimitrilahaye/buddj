import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  label = input<string | null>(null);
  type = input<string>('button');
  size = input<'big' | 'middle'>('middle');
  variant = input<'default' | 'danger'>('default');
  loading = input(false);
  disabled = input(false);
  click = output<Event>();

  get className() {
    return `button button--${this.size()} button--${this.variant()}`;
  }

  onClick(event: Event) {
    this.click.emit(event);
  }
}
