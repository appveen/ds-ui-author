import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
  pure: true
})
export class EllipsisPipe implements PipeTransform {

  transform(value: string, trimLength: number): string {
    if (!!value && !!value.length && value.length > trimLength) {
      return value.substr(0, trimLength).concat('...');
    }
    return value;
  }

}
