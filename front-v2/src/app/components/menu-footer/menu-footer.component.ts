import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-footer',
  standalone: true,
  imports: [NgClass],
  templateUrl: './menu-footer.component.html',
  styleUrl: './menu-footer.component.scss',
})
export class MenuFooterComponent {
  constructor(private router: Router) {}

  plusOpen = false;

  openPlus() {
    this.plusOpen = !this.plusOpen;
  }

  navigateToMonthCreation() {
    this.router.navigate(['month-creation']);
  }
}
