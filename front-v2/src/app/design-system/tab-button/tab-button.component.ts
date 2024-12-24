import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-tab-button',
  standalone: false,
  templateUrl: './tab-button.component.html',
  styleUrl: './tab-button.component.scss',
})
export class TabButtonComponent {
  id = input.required<string>();
  isFolded = input<boolean>(true);

  toggle = output<string>();

  toggleTab() {
    this.toggle.emit(this.id());
  }
}
