import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function amountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    const decimalPattern = /^-?\d+(\.\d{1,2})?$/;
    const valid = decimalPattern.test(value);

    return valid ? null : { invalidDecimal: true };
  };
}
