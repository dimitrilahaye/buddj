import { Component, Input, output } from '@angular/core';

@Component({
  selector: 'app-toggle-button',
  standalone: false,
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.scss',
})
export class ToggleButtonComponent {
  @Input() isToggled = false;
  toggleChange = output<boolean>();

  onToggle(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.isToggled = inputElement.checked;
    this.toggleChange.emit(this.isToggled);
  }
}
