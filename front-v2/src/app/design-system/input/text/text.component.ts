/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, forwardRef, input, Optional, Self } from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'app-input-text',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextComponent),
      multi: true,
    },
  ],
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent implements ControlValueAccessor {
  required = input(true);
  placeholder = input('');
  formControlName = input('');
  disabled = false;

  private _value: string | null = null;

  constructor(@Optional() @Self() public controlContainer: ControlContainer) {}

  onChange: (value: string | null) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

    this.value = inputValue;
  }

  get value(): string | null {
    return this._value;
  }

  set value(val: string | null) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this._value = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get hasError(): boolean {
    const control = this.controlContainer.control?.get(this.formControlName());
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }
}
