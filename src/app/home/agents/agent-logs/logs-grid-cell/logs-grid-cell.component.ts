import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'odp-logs-grid-cell',
  templateUrl: './logs-grid-cell.component.html',
  styleUrls: ['./logs-grid-cell.component.scss']
})
export class LogsGridCellComponent implements OnInit, ICellRendererAngularComp {

  params: ICellRendererParams;
  value: any;
  field: any;
  constructor() { }

  ngOnInit(): void {
  }

  agInit(params: ICellRendererParams): void {
    const self = this;
    self.params = params;
    self.value = params.value;
    self.field = params.colDef.field;
    if (self.field === 'content' && self.params.data && !self.value) {
      const segments = self.params.data.rawData.split(' ');
      segments.shift();
      segments.shift();
      segments.shift();
      segments.shift();
      segments.shift();
      segments.shift();
      self.value = segments.join(' ');
    }
    if (self.field === '_checkbox') {
      self.value = self.params.rowIndex + 1;
    }
  }

  refresh(params: any): boolean {
    const self = this;
    return true;
  }

  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    const self = this;
  }

}
