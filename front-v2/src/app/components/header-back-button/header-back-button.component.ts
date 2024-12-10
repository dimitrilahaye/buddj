import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-back-button',
  standalone: true,
  imports: [],
  templateUrl: './header-back-button.component.html',
  styleUrl: './header-back-button.component.scss',
})
export class HeaderBackButtonComponent {
  constructor(
    private readonly location: Location,
    private readonly router: Router
  ) {}

  back() {
    this.location.back();
  }

  backHome() {
    this.router.navigate(['/']);
  }
}
