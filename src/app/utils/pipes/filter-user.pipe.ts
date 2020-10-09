import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterUser',
  pure: false
})
export class FilterUserPipe implements PipeTransform {
  transform(list: any, filter: string) {
    const res = [];
    if (list.length === 0 || !filter) {
      return list;
    }

    const reg = new RegExp(filter.toLowerCase());
    list.forEach(i => {
      if (i.basicDetails.name.toLowerCase().match(reg)) {
        res.push(i);
      }
    });
    return res;
  }
}
