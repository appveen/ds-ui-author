import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-ag-grid-cell',
  templateUrl: './ag-grid-cell.component.html',
  styleUrls: ['./ag-grid-cell.component.scss']
})
export class AgGridCellComponent implements OnInit, ICellRendererAngularComp {

  value: any;
  definition: any;
  subscriptions: any;
  dataservices: Array<any>
  constructor(
    private commonService: CommonService,
  ) {
    const self = this;
    self.subscriptions = {};
    self.dataservices = [];
  }

  ngOnInit(): void {
    const self = this;
  }

  agInit(params: ICellRendererParams): void {
    const self = this;

    self.value = params.value;
    self.definition = params.column.getColDef();

  }
  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
    const self = this;
  }
  refresh(params: any): boolean {
    const self = this;
    return false;
  }
}
