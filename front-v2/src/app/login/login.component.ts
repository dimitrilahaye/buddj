import { Component, Inject } from '@angular/core';
import { DesignSystemModule } from '../design-system/design-system.module';
import {
  AUTHENTICATION_SERVICE,
  AuthenticationServiceInterface,
} from '../services/authentication/authentication.service.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DesignSystemModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(
    @Inject(AUTHENTICATION_SERVICE)
    private authenticationService: AuthenticationServiceInterface
  ) {}

  onLogin() {
    this.authenticationService.login();
  }
}
