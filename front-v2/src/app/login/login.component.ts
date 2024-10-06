import { Component, output } from '@angular/core';
import { DesignSystemModule } from '../design-system/design-system.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DesignSystemModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  login = output();

  onLogin() {
    this.login.emit();
  }
}
