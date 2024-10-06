import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  label = input.required<string>();
  login = output();

  onLogin() {
    this.login.emit();
  }
}
