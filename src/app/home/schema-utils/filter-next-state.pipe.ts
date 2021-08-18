import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterNextState'
})
export class FilterNextStatePipe implements PipeTransform {

  transform(value: Array<any>, ...args: any[]): any {
    if (value && args && args[0]) {

      if (typeof value[0] == 'number') {
        value = value.map(String)
      }

      return value.filter(e => e.toLowerCase().indexOf(args[0].toLowerCase()) > -1);
    }
    return value || [];
  }

}
