import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortDate',
  standalone: true,
})
export class ShortDatePipe implements PipeTransform {
  transform(date: string): unknown {
    const options = { year: 'numeric', month: 'short' };
    const formattedDate = new Date(date).toLocaleDateString(
      'fr-FR',
      options as Intl.DateTimeFormatOptions
    );
    return formattedDate;
  }
}
