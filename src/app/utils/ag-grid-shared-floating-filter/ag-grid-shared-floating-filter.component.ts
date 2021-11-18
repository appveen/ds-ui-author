import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { AgFrameworkComponent } from 'ag-grid-angular';
import { FilterChangedEvent, IFilterComp, IFloatingFilter, IFloatingFilterParams, TextFilter } from 'ag-grid-community';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AppService } from '../services/app.service';

const FilterTypesList = ['text', 'number', 'date', 'date-time', 'list_of_values'];
type FilterType = 'text' | 'number' | 'date' | 'date-time' | 'list_of_values';
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
  @ViewChild('toDateRef', { static: false}) toDateRef: ElementRef;
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
  timezone: string;
  fromDate: string;
  toDate: string;
  dateFilterType: string;
  dateFilterSet: boolean;

  get checkedCount(): number {
    return this.listItems?.length ? this.listItems.filter(x => x.checked).length : 0;
  }

  constructor(private appService: AppService) {
    this.listItems = [];
    this.debounceSubject = new Subject();
    this.dateFilterType = 'equals';
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
    if(['date', 'date-time'].includes(this.type)) {
      this.timezone = colDef.refData?.timezone || 'Zulu';
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
        case 'date-time':
          {
            const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const filterValue = filterModel[this.field].filter[this.field];
            let formatString = 'YYYY-MM-DD';
            if(this.type === 'date-time') {
              formatString += 'THH:mm';
            }
            if(!!filterValue?.$lt) {
              this.fromDate = this.appService.getMomentInTimezone(new Date(filterValue.$lt), localTimezone).format(formatString);
              this.toDate = null;
              this.dateFilterType = 'lessThan';
              this.dateFilterSet = true;
            } else if (!!filterValue?.$gt) {
              this.fromDate = this.appService.getMomentInTimezone(new Date(filterValue.$gt), localTimezone).format(formatString);
              this.toDate = null;
              this.dateFilterType = 'greaterThan';
              this.dateFilterSet = true;
            } else if (!!filterValue?.$lte && !!filterValue?.$gte) {
              const lte = new Date(filterValue.$lte);
              const gte = new Date(filterValue.$gte);
              this.fromDate = this.appService.getMomentInTimezone(gte, localTimezone).format(formatString);
              this.toDate = this.appService.getMomentInTimezone(lte, localTimezone).format(formatString);
              this.dateFilterType = lte.getDate() - gte.getDate() > 0 ? 'inRange' : 'equals';
              this.dateFilterSet = true;
            }
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

  prepareList(clear?:boolean) {
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
        if (!clear && !!this.listItems?.length) {
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
    // if (!parentModel || Object.keys(parentModel).length === 0) {
    //   this.otherItemInput = null;
    //   this.prepareList(true);
    //   this.fromDate = null;
    //   this.toDate = null;
    //   this.dateFilterSet = false;
    //   this.dateFilterType = 'equals';
    // }
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
      case 'date-time':
        {
          const queryDate = this.getDateQuery();
          obj = !!queryDate && !!Object.keys(queryDate).length ? { [this.field]: queryDate } : null;
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

  private getDateQuery() {
    const obj = {};
    let fromDate, toDate;
    if (!!this.fromDate && (this.dateFilterType !== 'inRange' || !!this.toDate)) {
      switch(this.dateFilterType) {
        case 'equals': {
          if(this.type === 'date') {
            fromDate = this.appService.getMomentInTimezone(new Date(this.fromDate), this.timezone || 'Zulu', 'time:start');
            toDate = this.appService.getMomentInTimezone(new Date(this.fromDate), this.timezone || 'Zulu', 'time:end');
          } else {
            fromDate = this.appService.getMomentInTimezone(new Date(this.fromDate + ':00'), this.timezone || 'Zulu', 'ms:start');
            toDate = this.appService.getMomentInTimezone(new Date(this.fromDate + ':59'), this.timezone || 'Zulu', 'ms:end');
          }
          obj['$gte'] = fromDate.toISOString();
          obj['$lte'] = toDate.toISOString();
        };
        break;
        case 'inRange': {
          if(this.type === 'date') {
            fromDate = this.appService.getMomentInTimezone(new Date(this.fromDate), this.timezone || 'Zulu', 'time:start');
            toDate = this.appService.getMomentInTimezone(new Date(this.toDate), this.timezone || 'Zulu', 'time:end');
          } else {
            fromDate = this.appService.getMomentInTimezone(new Date(this.fromDate + ':00'), this.timezone || 'Zulu', 'ms:start');
            toDate = this.appService.getMomentInTimezone(new Date(this.toDate + ':59'), this.timezone || 'Zulu', 'ms:end');
          }
          obj['$gte'] = fromDate.toISOString();
          obj['$lte'] = toDate.toISOString();
        };
        break;
        case 'lessThan': {
          if(this.type === 'date') {
            fromDate = this.appService.getMomentInTimezone(new Date(this.fromDate), this.timezone || 'Zulu', 'time:start');
          } else {
            fromDate = this.appService.getMomentInTimezone(new Date(this.fromDate + ':00'), this.timezone || 'Zulu', 'ms:start');
          }
          obj['$lt'] = fromDate.toISOString();
        };
        break;
        case 'greaterThan': {
          if(this.type === 'date') {
            toDate = this.appService.getMomentInTimezone(new Date(this.fromDate), this.timezone || 'Zulu', 'time:end');
          } else {
            toDate = this.appService.getMomentInTimezone(new Date(this.fromDate + ':59'), this.timezone || 'Zulu', 'ms:end');
          }
          obj['$gt'] = toDate.toISOString();
        };
        break;
      }
    }
    return obj;
  }

  private getFilterType(type: string) {
    return isFilterType(type) ? type : null;
  }
}
