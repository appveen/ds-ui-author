import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'odp-faas-cell',
  templateUrl: './faas-cell.component.html',
  styleUrls: ['./faas-cell.component.scss']
})
export class FaasCellComponent implements ICellRendererAngularComp {

  params: ICellRendererParams;
  data: any;
  field: string;
  value: any;
  constructor() { }
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.data = params.node.data;
    this.value = params.value;
    this.field = params.colDef.field;
  }

  refresh(params: ICellRendererParams): boolean {
    return true;
  }
}
