import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button-icon',
  standalone: false,
  templateUrl: './button-icon.component.html',
  styleUrl: './button-icon.component.scss',
})
export class ButtonIconComponent {
  icon = input<string | null>(null);
  variant = input<'default' | 'danger'>('default');
  loading = input(false);
  disabled = input(false);
  click = output<Event>();

  get className() {
    return `icon icon--${this.variant()}`;
  }

  onClick(event: Event) {
    this.click.emit(event);
  }
}
