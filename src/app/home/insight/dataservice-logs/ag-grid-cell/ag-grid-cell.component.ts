import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
@Component({
  selector: 'odp-ag-grid-cell',
  templateUrl: './ag-grid-cell.component.html',
  styleUrls: ['./ag-grid-cell.component.scss']
})
export class AgGridCellComponent implements ICellRendererAngularComp {
  value: any;
  definition: any;
  subscriptions: any;
  dataservices: Array<any>;
  statusCodeClass: any;
  params: ICellRendererParams;
  timer;
  delay = 200;
  prevent = false;

  constructor() {
    this.subscriptions = {};
    this.dataservices = [];
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.definition = params.column.getColDef();
    if (this.definition.field === 'serviceId' && !!params.context?.nameFormatter) {
      const formatter = params.context.nameFormatter.bind(params.context);
      this.value = formatter(params);
    } else {
      this.value = params.value;
    }
    if (this.definition.field === 'statusCode') {
      this.statusCodeClass = {
        info: this.value < 200,
        success: this.value >= 200 && this.value < 300,
        redirect: this.value >= 300 && this.value < 400,
        error: this.value >= 400
      };
    }
  }

  refresh(params: any): boolean {
    return false;
  }

  filterOnTxnId(event: KeyboardEvent) {
    event.stopPropagation();
    this.timer = setTimeout(() => {
      if (!this.prevent) {
        this.params.api.setFilterModel({
          [this.definition.field]: {
            filter: `${this.value}`
          }
        });
        this.params.api.refreshHeader();
      }
      this.prevent = false;
    }, 200);
  }

  onDoubleClick(event) {
    event.stopPropagation();
    if(!!this.timer) {
      clearTimeout(this.timer);
    }
    this.prevent = true;
  }
}
