import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle-visibility-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toggle-visibility-button.component.html',
  styleUrl: './toggle-visibility-button.component.scss',
})
export class ToggleVisibilityButtonComponent {
  index = input.required<number>();
  clicked = output<number>();
  open = true;

  toggle() {
    this.open = !this.open;
    this.clicked.emit(this.index());
  }
}
