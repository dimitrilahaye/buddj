import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: false,
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
})
export class ProgressBarComponent {
  @Input()
  total = 0;

  @Input()
  currentValue = 0;

  get progressPercentage() {
    const totalValue = this.total;
    return totalValue > 0
      ? (Math.abs(this.currentValue) / totalValue) * 100
      : 0;
  }

  get progressClass() {
    return this.currentValue >= 0
      ? 'progress-bar__fill--default'
      : 'progress-bar__fill--danger';
  }
}
