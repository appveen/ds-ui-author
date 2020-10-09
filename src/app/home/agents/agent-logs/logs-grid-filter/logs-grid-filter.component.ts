import { Component, OnInit, ElementRef } from '@angular/core';
import {
  IFloatingFilter,
  IFloatingFilterParams,
  FilterChangedEvent,
  IAfterGuiAttachedParams,
  TextFilter,
  IFilterComp
} from 'ag-grid-community';
import { AgFrameworkComponent } from 'ag-grid-angular';

@Component({
  selector: 'odp-logs-grid-filter',
  templateUrl: './logs-grid-filter.component.html',
  styleUrls: ['./logs-grid-filter.component.scss']
})
export class LogsGridFilterComponent implements OnInit, IFloatingFilter, AgFrameworkComponent<IFloatingFilterParams> {

  params: IFloatingFilterParams;
  field: string;
  value: any;
  filterInstance: TextFilter;
  constructor(private ele: ElementRef) {
    const self = this;
    self.ele.nativeElement.classList.add('w-100');
    self.value = '';
  }

  ngOnInit(): void {
  }

  agInit(params: IFloatingFilterParams): void {
    const self = this;
    self.params = params;
    self.field = params.column.getColDef().field;
    self.params.parentFilterInstance(function (instance: IFilterComp) {
      self.filterInstance = (instance as TextFilter);
    });
  }

  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {

  }

  onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent): void {
    const self = this;
    const filterModel = self.params.api.getFilterModel();
    if (!filterModel[self.field]) {
      self.value = '';
    }
  }

  onChange(value) {
    const self = this;
    let temp = {};
    if (!value || !value.trim()) {
      temp = {};
      self.filterInstance.onFloatingFilterChanged('text', null);
    } else {
      if (self.field === 'timeStamp') {
        temp[self.field] = self.getDateTimeQuery(value);
      } else if (self.field === 'logLevel') {
        temp[self.field] = value;
      } else {
        temp['$or'] = [{ [self.field]: '/' + value + '/' }, { rawData: '/' + value + '/' }];
      }
      self.filterInstance.onFloatingFilterChanged('text', JSON.stringify(temp));
    }
  }

  getDateTimeQuery(value) {
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
