import { Component, Input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input()
  modalOpen = false;
  click = output<Event>();

  onClick(event: Event) {
    this.click.emit(event);
  }

  doNothing(event: Event) {
    event.stopPropagation();
  }
}
