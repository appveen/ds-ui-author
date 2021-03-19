import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'odp-attributes-cell-renderer',
  templateUrl: './attributes-cell-renderer.component.html',
  styleUrls: ['./attributes-cell-renderer.component.scss']
})
export class AttributesCellRendererComponent implements AgRendererComponent {
  value: any;
  field: string;

  constructor() { }
  
  agInit(params: ICellRendererParams): void {
    this.value = params.value;
    this.field = params.colDef.field;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

}
