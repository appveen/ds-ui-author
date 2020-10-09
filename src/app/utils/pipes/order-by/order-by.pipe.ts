import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(value: Array<any>, args?: any) {
    if (value && value.length > 0) {
      return value.sort((a, b) => {
        if (typeof a === 'object') {
          return this.compare(a[args], b[args]);
        } else {
          return this.compare(a, b);
        }
      });
    }
    return [];
  }

  private compare(a, b) {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  }
}
