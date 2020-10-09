import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indexToPos'
})
export class IndexToPosPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    const unitDigit = value % 10;
    if ((unitDigit + 1) === 1) {
      return (value + 1) + 'st';
    } else if ((unitDigit + 1) === 2) {
      return (value + 1) + 'nd';
    } else if ((unitDigit + 1) === 3) {
      return (value + 1) + 'rd';
    } else {
      return (value + 1) + 'th';
    }
  }

}
