import { Component, OnDestroy } from '@angular/core';
import { AgFrameworkComponent } from 'ag-grid-angular';
import { FilterChangedEvent, IFilterComp, IFloatingFilter, IFloatingFilterParams, TextFilter } from 'ag-grid-community';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

const FilterTypesList = ['text', 'number', 'date', 'list_of_values'];
type FilterType = 'text' | 'number' | 'date' | 'list_of_values';
const isFilterType = (x: any): x is FilterType => {
  return typeof x === 'string' && FilterTypesList.includes(x);
};

interface FilterListItem {
  label: string;
  value: string;
  checked?: boolean;
}

type MapperFunction = (data: any[]) => FilterListItem[];
const isMapperFunction = (x: any): x is MapperFunction => {
  return typeof x === 'function' && x.length === 1;
};

@Component({
  selector: 'odp-ag-grid-shared-floating-filter',
  templateUrl: './ag-grid-shared-floating-filter.component.html',
  styleUrls: ['./ag-grid-shared-floating-filter.component.scss']
})
export class AgGridSharedFloatingFilterComponent implements IFloatingFilter, AgFrameworkComponent<IFloatingFilterParams>, OnDestroy {
  params: IFloatingFilterParams;
  type: FilterType;
  listItems: Array<FilterListItem>;
  field: string;
  mapperFunction: MapperFunction;
  debounceSubject: Subject<any>;
  debounceSubscription: Subscription;
  showListDropdown: boolean;
  listContainerStyle: any;
  showLoading: boolean;
  otherItemInput: string;
  otherItemChecked: boolean;
  showOtherBox: boolean;

  get checkedCount(): number {
    return this.listItems?.length ? this.listItems.filter(x => x.checked).length : 0;
  }

  constructor() {
    this.listItems = [];
    this.debounceSubject = new Subject();
  }

  agInit(params: IFloatingFilterParams): void {
    this.params = params;
    const colDef = params.column.getColDef();
    this.field = colDef.field;
    this.type = this.getFilterType(colDef.refData?.filterType);
    this.showOtherBox = this.type === 'list_of_values' && !!colDef.refData?.allowOther;
    this.prepareList();
    if (['text', 'number'].includes(this.type)) {
      this.debounceSubscription = this.debounceSubject
        .pipe(debounceTime(600), distinctUntilChanged())
        .subscribe(event => this.onChange(event));
    }
    const filterModel = this.params.api.getFilterModel();
    if (this.field in filterModel) {
      switch (this.type) {
        case 'text':
          {
            this.otherItemInput =
              typeof filterModel[this.field].filter === 'string'
                ? filterModel[this.field].filter
                : filterModel[this.field].filter[this.field].slice(1, -1);
          }
          break;
        case 'number':
          {
            this.otherItemInput = filterModel[this.field].filter[this.field];
          }
          break;
        case 'date':
          {
            this.otherItemInput = filterModel[this.field].filter[this.field].$lte.split('T')[0];
          }
          break;
      }
    }
  }

  ngOnDestroy() {
    if (!!this.debounceSubscription) {
      this.debounceSubscription.unsubscribe();
    }
  }

  prepareList() {
    const colDef = this.params.column.getColDef();
    if (
      this.type === 'list_of_values' &&
      !!colDef?.refData?.mapperFunction &&
      !!this.params.filterParams?.context &&
      !!this.params.filterParams.context[colDef.refData.mapperFunction] &&
      isMapperFunction(this.params.filterParams.context[colDef.refData.mapperFunction])
    ) {
      const context = this.params.filterParams.context;
      this.mapperFunction = context[colDef.refData.mapperFunction].bind(context);
      this.showLoading = true;
      setTimeout(() => {
        const rowData = [];
        this.params.api.forEachNode(rowNode => {
          rowData.push(rowNode.data);
        });
        let tempListItems: FilterListItem[] = this.mapperFunction(rowData);
        if (!!this.listItems?.length) {
          const otherItems = tempListItems.filter(tempObj => this.listItems.every(item => item.value !== tempObj.value));
          tempListItems = [...this.listItems, ...otherItems.map(item => ({ ...item, checked: !!item.checked }))];
        } else {
          tempListItems = tempListItems.map(item => ({ ...item, checked: !!item.checked }));
        }
        const temp: FilterListItem[] = [];
        tempListItems.forEach(item => {
          if (temp.every(tItem => item.value !== tItem.value)) {
            temp.push(item);
          }
        });
        this.listItems = [...temp];
        const filterModel = this.params.api.getFilterModel();
        if (!!filterModel && this.field in filterModel) {
          const checkedItems = filterModel[this.field]['filter'][this.field]['$in'];
          checkedItems.forEach(value => {
            const foundItem = this.listItems.find(item => item.value === value);
            if (!!foundItem) {
              foundItem.checked = true;
            } else {
              this.listItems = [...this.listItems, { value, label: value, checked: true }];
            }
          });
        }
        this.showLoading = false;
      }, 1000);
    }
  }

  onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent): void {
    if (!parentModel || Object.keys(parentModel).length === 0) {
      this.otherItemInput = null;
      this.prepareList();
    }
  }

  debounceInput(event) {
    this.debounceSubject.next(event);
  }

  onChange(value?: any) {
    let obj = null;
    switch (this.type) {
      case 'text':
        {
          obj = !!value?.trim() ? { [this.field]: `/${value}/` } : null;
        }
        break;
      case 'number':
        {
          obj = !!value?.trim() ? { [this.field]: +value } : null;
        }
        break;
      case 'date':
        {
          const queryDate = this.getDateQuery(value);
          obj = !!queryDate ? { [this.field]: queryDate } : null;
        }
        break;
      case 'list_of_values':
        {
          const checkedItems = this.listItems.filter(item => item.checked).map(item => item.value);
          if (this.otherItemChecked && !!this.otherItemInput) {
            checkedItems.push(this.otherItemInput);
          }
          obj = !!checkedItems.length ? { [this.field]: { $in: checkedItems } } : null;
        }
        break;
    }
    this.params.parentFilterInstance(function (instance: IFilterComp) {
      (instance as TextFilter).onFloatingFilterChanged('like', obj ? JSON.stringify(obj) : null);
    });
  }

  toggleChecks(clear: boolean) {
    this.listItems = this.listItems.map(item => ({ ...item, checked: !clear }));
    this.otherItemChecked = this.showOtherBox && !clear;
  }

  private getDateQuery(value: any) {
    if (!!value) {
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
      const obj = {};
      obj['$gte'] = fromDate.toISOString();
      obj['$lte'] = toDate.toISOString();
      return obj;
    }
  }

  private getFilterType(type: string) {
    return isFilterType(type) ? type : null;
  }
}
