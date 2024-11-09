import { Component, input, Input, output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input()
  modalOpen = false;
  cssClassString = input<string>('');
  click = output<Event>();

  onClick(event: Event) {
    this.click.emit(event);
  }

  doNothing(event: Event) {
    event.stopPropagation();
  }
}
