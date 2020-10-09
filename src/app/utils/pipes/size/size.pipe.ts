import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'size'
})
export class SizePipe implements PipeTransform {
  size = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  transform(value: any, ...args: any[]): any {
    let count = 0;
    if (value) {
      if (typeof value === 'string') {
        value = parseFloat(value);
      }
      while (value > 1024) {
        value = value / 1024;
        count++;
      }
      return value.toFixed(2) + this.size[count];
    }
    return '0';
  }

}
