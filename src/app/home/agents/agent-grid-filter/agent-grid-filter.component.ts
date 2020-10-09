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
  selector: 'odp-agent-grid-filter',
  templateUrl: './agent-grid-filter.component.html',
  styleUrls: ['./agent-grid-filter.component.scss']
})
export class AgentGridFilterComponent implements OnInit, IFloatingFilter, AgFrameworkComponent<IFloatingFilterParams> {

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
      if (self.field === 'lastInvokedAt') {
        temp[self.field] = self.getDateTimeQuery(value);
      } else if (self.field === 'status' || self.field === 'pendingFiles') {
        temp[self.field] = value;
      } else {
        temp[self.field] = '/' + value + '/';
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

  get showFilter() {
    const self = this;
    if (self.field === 'password'
      || self.field === 'heartbeat'
      || self.field === 'streak'
      || self.field === '_options') {
      return false;
    }
    return true;
  }
}
