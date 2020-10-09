import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterDefinition'
})
export class FilterDefinitionPipe implements PipeTransform {

  transform(value: Array<any>, ...args: any[]): any {
    if (value && args && args[0]) {
      return value.filter(e => e.properties.name.toLowerCase().indexOf(args[0].toLowerCase()) > -1);
    }
    return value || [];
  }

}
