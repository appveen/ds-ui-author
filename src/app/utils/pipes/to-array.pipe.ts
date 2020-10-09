import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toArray'
})
export class ToArrayPipe implements PipeTransform {

  transform(value: any, args?: any) {
    const arr = [];
    Object.keys(value).forEach(key => {
      arr.push({ key, value: value[key] });
    });
    return arr;
  }

}
