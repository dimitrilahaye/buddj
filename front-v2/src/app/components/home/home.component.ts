import { Component } from '@angular/core';
import { MenuFooterComponent } from '../menu-footer/menu-footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuFooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
