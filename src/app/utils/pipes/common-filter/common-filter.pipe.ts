import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commonFilter'
})
export class CommonFilterPipe implements PipeTransform {

  transform(value: any, field: string, term?: any) {
    const res = [];
    if (!value || value.length === 0 || !term || !field) {
      return value;
    }
    const reg = new RegExp(term.toLowerCase());
    value.forEach(i => {
      if (i[field].toLowerCase().match(reg)) {
        res.push(i);
      }
    });
    return res;
  }

}
