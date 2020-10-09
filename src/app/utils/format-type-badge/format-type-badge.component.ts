import { Component, Input } from '@angular/core';

@Component({
  selector: 'odp-format-type-badge',
  templateUrl: './format-type-badge.component.html',
  styleUrls: ['./format-type-badge.component.scss']
})
export class FormatTypeBadgeComponent {

  @Input() class: string;
  @Input() data: Format;
  @Input() small: boolean;

  constructor() { }

  get formatType() {
    if (!this.data) {
      return 'json';
    }
    switch (this.data.formatType) {
      case 'XML':
        return 'xml';
      case 'EXCEL':
        return this.data.excelType;
      case 'FLATFILE':
        return 'fixed'
      case 'BINARY':
        return 'bin';
      case 'CSV':
        return this.data.character === ',' ? 'csv' : 'delimiter';
      case 'DELIMITER':
        return 'delimiter';
      default:
        return 'json';
    }
  }
}


export interface Format {
  id?: string;
  name?: string;
  attributeCount?: number;
  type?: string;
  definition?: string;
  formatType?: string;
  excelType?: string;
  character?: string;
  length?: number;
}
