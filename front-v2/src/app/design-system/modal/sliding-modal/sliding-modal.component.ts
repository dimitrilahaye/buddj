import { Component, Input, output } from '@angular/core';

@Component({
  selector: 'app-sliding-modal',
  standalone: false,
  templateUrl: './sliding-modal.component.html',
  styleUrl: './sliding-modal.component.scss',
})
export class SlidingModalComponent {
  @Input()
  isOpen = false;

  close = output();

  closeModal() {
    this.isOpen = false;
    setTimeout(() => {
      this.close.emit();
    }, 300);
  }
}
