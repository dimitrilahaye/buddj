import {
  Component,
  Input,
  OnInit,
  output,
  signal,
  WritableSignal,
} from '@angular/core';

@Component({
  selector: 'app-numpad',
  templateUrl: './numpad.component.html',
  styleUrl: './numpad.component.scss',
})
export class NumpadComponent implements OnInit {
  @Input()
  value: string | null = null;

  updatedValue: WritableSignal<string | null> = signal(null);

  submitted = output<string>();

  ngOnInit(): void {
    this.updatedValue.set(this.value);
  }

  updateValue(appendValue: string, event: Event) {
    this.updatedValue.update((val) => {
      if (this.hasDecimals(val)) {
        return val;
      }
      if (this.endsWithComa(val) && appendValue === ',') {
        return val;
      }
      if (val === '0') {
        return appendValue;
      }
      return val + appendValue;
    });
    event.stopPropagation();
  }

  private hasDecimals(val: string | null) {
    return val?.includes(',') && val.split(',').at(-1)?.length === 2;
  }

  private endsWithComa(val: string | null) {
    return val?.charAt(val?.length - 1) === ',';
  }

  cancel(event: Event) {
    this.updatedValue.update((val) => {
      const deletedValue = val?.slice(0, -1) ?? val;
      if (deletedValue !== null && deletedValue.length === 0) {
        return '0';
      }
      return deletedValue;
    });
    event.stopPropagation();
  }

  refresh(event: Event) {
    this.updatedValue.update(() => {
      return '0';
    });
    event.stopPropagation();
  }

  submit(event: Event) {
    this.submitted.emit(this.updatedValue()!);
    event.stopPropagation();
  }
}
