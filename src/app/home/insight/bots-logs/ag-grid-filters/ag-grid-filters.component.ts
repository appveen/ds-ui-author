import { Component, OnInit } from '@angular/core';
import { IFloatingFilter, IFloatingFilterParams, FilterChangedEvent, GridApi, Column, IFilterComp, TextFilter } from 'ag-grid-community';
import { AgFrameworkComponent } from 'ag-grid-angular';

@Component({
  selector: 'odp-ag-grid-filters',
  templateUrl: './ag-grid-filters.component.html',
  styleUrls: ['./ag-grid-filters.component.scss']
})
export class AgGridFiltersComponent implements OnInit, IFloatingFilter, AgFrameworkComponent<IFloatingFilterParams> {

  value;
  definition: any;
  api: GridApi;
  column: Column;
  params: IFloatingFilterParams;
  constructor() { }


  ngOnInit(): void {
  }

  agInit(params: IFloatingFilterParams) {
    const self = this;
    self.params = params;
    self.column = params.column;
    self.api = params.api;
    self.definition = self.column.getColDef();
  }
  onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent): void {
    const self = this;
  }
  onChange(value) {
    const self = this;
    let temp = {};
    if (self.definition.field === '_metadata.createdAt') {
      temp[self.definition.field] = self.getDateQuery(value);

    } else {
      temp[self.definition.field] = '/' + value + '/';
    }
    if (!value || !value.trim()) {
      temp = null;
    }
    self.params.parentFilterInstance(function (instance: IFilterComp) {
      (instance as TextFilter).onFloatingFilterChanged('like', temp ? JSON.stringify(temp) : '');
    });
  }
  getDateQuery(value: any) {
    const obj = {};
    if (value) {
      const fromDate = new Date(value);
      fromDate.setHours(0);
      fromDate.setMinutes(0);
      fromDate.setSeconds(0);
      fromDate.setMilliseconds(0);
      const toDate = new Date(value);
      toDate.setHours(23);
      toDate.setMinutes(59);
      toDate.setSeconds(59);
      toDate.setMilliseconds(999);
      obj['$gte'] = fromDate.toISOString();
      obj['$lte'] = toDate.toISOString();
    }
    return obj;
  }
}
