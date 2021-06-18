import { Component, ElementRef } from '@angular/core';
import { AgFrameworkComponent } from 'ag-grid-angular';
import { FilterChangedEvent, IFilterComp, IFloatingFilter, IFloatingFilterParams, NumberFilter, TextFilter } from 'ag-grid-community';

@Component({
  selector: 'odp-faas-filter',
  templateUrl: './faas-filter.component.html',
  styleUrls: ['./faas-filter.component.scss']
})
export class FaasFilterComponent implements IFloatingFilter, AgFrameworkComponent<IFloatingFilterParams> {

  params: IFloatingFilterParams;
  field: string;
  value: any;
  filterInstance: TextFilter | NumberFilter;
  constructor(private ele: ElementRef) { }
  agInit(params: IFloatingFilterParams): void {
    this.params = params;
    this.field = params.column.getColDef().field;
    this.params.parentFilterInstance((instance: IFilterComp) => {
      this.filterInstance = (instance as (TextFilter | NumberFilter));
    });
    // this.ele.nativeElement.classList.push('w-100');
  }

  onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent): void {
    const filterModel = this.params.api.getFilterModel();
    if (!filterModel[this.field]) {
      this.value = '';
    }
  }

  onChange(value) {
    let temp = {};
    if (!value || !value.trim()) {
      temp = {};
      this.filterInstance.onFloatingFilterChanged('text', null);
    } else {
      if (this.field === 'lastInvokedAt') {
        temp[this.field] = this.getDateTimeQuery(value);
      } else if (this.field === 'status' || this.field === 'pendingFiles') {
        temp[this.field] = value;
      } else {
        temp[this.field] = '/' + value + '/';
      }
      this.filterInstance.onFloatingFilterChanged('text', JSON.stringify(temp));
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
    if (this.field === '_options') {
      return false;
    }
    return true;
  }
}
