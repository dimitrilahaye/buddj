import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header-back-button',
  standalone: true,
  imports: [],
  templateUrl: './header-back-button.component.html',
  styleUrl: './header-back-button.component.scss',
})
export class HeaderBackButtonComponent {
  constructor(private readonly location: Location) {}

  back() {
    this.location.back();
  }
}
