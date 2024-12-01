import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-back-to-home',
  standalone: true,
  imports: [],
  templateUrl: './header-back-to-home.component.html',
  styleUrl: './header-back-to-home.component.scss',
})
export class HeaderBackToHomeComponent {
  constructor(private readonly router: Router) {}

  backToHome() {
    this.router.navigate(['home']);
  }
}
