import { Component, input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-animated-spinner',
  templateUrl: './animated-spinner.component.html',
  styleUrl: './animated-spinner.component.scss',
})
export class AnimatedSpinnerComponent {
  width = input(10);
  height = input(10);
}
