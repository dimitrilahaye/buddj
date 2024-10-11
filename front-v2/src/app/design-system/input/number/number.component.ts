/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, forwardRef, input, Optional, Self } from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'app-input-number',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberComponent),
      multi: true,
    },
  ],
  templateUrl: './number.component.html',
  styleUrl: './number.component.scss',
})
export class NumberComponent implements ControlValueAccessor {
  required = input(true);
  placeholder = input('');
  step = input('0.01');
  size = input<'big' | 'middle'>('middle');
  formControlName = input('');

  private _value: number | null = null;

  constructor(@Optional() @Self() public controlContainer: ControlContainer) {}

  onChange: (value: number | null) => void = () => {};
  onTouched: () => void = () => {};
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

    const sanitizedValue = inputValue.replace(',', '.');

    const parsedValue = parseFloat(sanitizedValue);

    if (!isNaN(parsedValue)) {
      this.value = parsedValue;
    } else if (inputValue === '') {
      this.value = null;
    }
  }

  get value(): number | null {
    return this._value;
  }

  set value(val: number | null) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  writeValue(value: number | null): void {
    this._value = value;
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  get className() {
    return `input-number__input input-number__input--${this.size()}`;
  }

  get hasError(): boolean {
    const control = this.controlContainer.control?.get(this.formControlName());
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }
}
