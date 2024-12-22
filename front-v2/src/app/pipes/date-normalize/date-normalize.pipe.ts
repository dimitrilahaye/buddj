import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateNormalize',
  standalone: true,
})
export class DateNormalizePipe implements PipeTransform {
  transform(value: string): unknown {
    const event = new Date(value);
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    };
    return event.toLocaleDateString('fr-FR', options);
  }
}
