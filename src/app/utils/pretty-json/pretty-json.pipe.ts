import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyJson'
})
export class PrettyJsonPipe implements PipeTransform {

  transform(value: any, args?: any) {
    let temp;
    if (typeof value === 'object') {
      temp = '<div class="d-flex flex-column pretty-json"><span class="text-muted font-weight-bold">{</span>';
      Object.keys(value).forEach(key => {
        if (typeof value[key] === 'object') {
          if (Array.isArray(value[key])) {
            temp += `<div class="d-flex align-items-start">
        <span class="key text-secondary font-weight-bold">${key}</span><span class="colon text-dark font-weight-bold">:&nbsp;</span>
        <span class="value object">[${this.transform(value[key][0])}]</span></div>`;
          } else {
            temp += `<div class="d-flex align-items-start">
        <span class="key text-secondary font-weight-bold">${key}</span><span class="colon text-dark font-weight-bold">:&nbsp;</span>
        <span class="value object">${this.transform(value[key])}</span></div>`;
          }
        } else if (typeof value[key] === 'number') {
          temp += `<div class="d-flex align-items-center">
        <span class="key text-secondary font-weight-bold">${key}</span>
        <span class="colon text-dark font-weight-bold">:&nbsp;</span>
        <span class="value font-weight-bold number text-info">${value[key]}</span></div>`;
        } else if (typeof value[key] === 'boolean') {
          temp += `<div class="d-flex align-items-center">
        <span class="key text-secondary font-weight-bold">${key}</span>
        <span class="colon text-dark font-weight-bold">:&nbsp;</span>
        <span class="value font-weight-bold boolean text-primary">${value[key]}</span></div>`;
        } else {
          temp += `<div class="d-flex align-items-center">
        <span class="key text-secondary font-weight-bold">${key}</span>
        <span class="colon text-dark font-weight-bold">:&nbsp;</span>
        <span class="value font-weight-bold string text-accent">"${value[key]}"</span></div>`;
        }
      });
      temp += '<span class="text-muted font-weight-bold">}</span></div>';
    } else {
      temp = value;
    }
    return temp;
  }

}
