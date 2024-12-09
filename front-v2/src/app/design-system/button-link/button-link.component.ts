import { Component, output } from '@angular/core';

@Component({
  selector: 'app-button-link',
  standalone: false,
  templateUrl: './button-link.component.html',
  styleUrl: './button-link.component.scss',
})
export class ButtonLinkComponent {
  onClick = output();

  clicked(event: Event) {
    event.preventDefault();
    this.onClick.emit();
  }
}
