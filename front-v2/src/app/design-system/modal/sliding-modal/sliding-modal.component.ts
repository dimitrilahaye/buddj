import { Component, input, Input, output } from '@angular/core';

@Component({
  selector: 'app-sliding-modal',
  standalone: false,
  templateUrl: './sliding-modal.component.html',
  styleUrl: './sliding-modal.component.scss',
})
export class SlidingModalComponent {
  @Input()
  isOpen = false;
  canClose = input(true);

  close = output<Event>();

  closeModal(event: Event) {
    if (this.canClose()) {
      this.isOpen = false;
      setTimeout(() => {
        this.close.emit(event);
      }, 300);
    }
  }
}
