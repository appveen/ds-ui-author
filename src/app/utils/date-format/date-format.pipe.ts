import { Pipe, PipeTransform } from '@angular/core';
import * as momentTz from 'moment-timezone';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string, format: string, timeZone?: string): unknown {
    if(!value) {
      return value;
    }
    try {
      const date = new Date(value);
      const momentDate = momentTz(date.toISOString());
      return !!timeZone ? momentDate.tz(timeZone).format(format) : momentDate.format(format);
    } catch (e) {
      return value;
    }
  }

}
