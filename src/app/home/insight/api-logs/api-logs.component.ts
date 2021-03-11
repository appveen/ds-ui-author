import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModalRef, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { AgGridSharedFloatingFilterComponent } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.component';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { AgGridCellComponent } from '../dataservice-logs/ag-grid-cell/ag-grid-cell.component';

@Component({
  selector: 'odp-api-logs',
  templateUrl: './api-logs.component.html',
  styleUrls: ['./api-logs.component.scss']
})
export class ApiLogsComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @ViewChild('agGrid', { static: false }) agGrid: AgGridAngular;
  @ViewChild('logModal', { static: false }) logModal: TemplateRef<any>;
  @ViewChild('tooltip', { static: false }) tooltip: NgbTooltip;

  public gridApi: GridApi;
  public gridOptions: GridOptions;
  logModalRef: NgbModalRef;
  subscriptions: any;
  showLazyLoader: boolean;
  apiConfig: APIConfig;
  selectedLog: any;
  showDetail: boolean;
  activeTab: number;
  rowData: Array<any>;
  resMappings: any;
  responseType: any;
  operationType: Array<any>;
  showLogOptions: boolean;
  showResponseOptions: boolean;
  paginationPageSize = 30;
  filterModel: any;
  dataSource: IDatasource;
  totalRecordsCount;
  currentRecordsCount;
  activeModalTab = 0;
  loaded: number;
  dataservices: Array<any>;
  frameworkComponents: any;
  getRowsDebounceSubject: Subject<any>;
  htmlContent;
  constructor(private commonService: CommonService, private appService: AppService) {
    const self = this;
    self.showLazyLoader = false;
    self.apiConfig = {};
    self.apiConfig = {
      count: 30,
      page: 1,
      noApp: true
    };
    self.subscriptions = {};
    self.activeTab = 0;
    self.responseType = {
      '200': true,
      '400': true,
      '500': true
    };
    self.operationType = [
      { value: 'GET', checked: false },
      ...(['POST', 'PUT', 'DELETE'].map(value => ({ value, checked: true })))
    ];
    self.apiConfig.filter = {
      app: self.commonService.app._id,
      $and: [{ operation: { $in: self.operationType.filter(op => !!op.checked).map(op => op.value) } }]
    };
    self.dataservices = [];
    self.getRowsDebounceSubject = new Subject();
  }

  ngOnInit(): void {
    const self = this;
    self.getAllDataServices();
    self.setupGrid();
  }

  setupGrid() {
    this.subscriptions['debounce_get_rows'] = this.getRowsDebounceSubject
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe(params => {
        this.getRows(params);
      });
    this.frameworkComponents = {
      customCellRenderer: AgGridCellComponent
    }
    const defaultColDef: ColDef = {
      filter: 'agTextColumnFilter',
      filterParams: {
        caseSensitive: true,
        suppressAndOrCondition: true,
        suppressFilterButton: true
      },
      headerClass: 'hide-filter-icon',
      suppressMenu: true,
      sortable: true,
      resizable: true,
      cellRenderer: 'customCellRenderer',
      floatingFilterComponentFramework: AgGridSharedFloatingFilterComponent,
    };
    const columnDefs = [
      {
        headerName: 'Time',
        field: '_metadata.createdAt',
        minWidth: 180,
        refData: {
          filterType: 'date'
        }
      },
      {
        headerName: 'Data Service',
        field: 'serviceId',
        minWidth: 140,
        refData: {
          filterType: 'list_of_values',
          mapperFunction: 'gridDSNameMapper'
        }
      },
      {
        headerName: 'TxnId',
        field: 'txnId',
        refData: {
          filterType: 'text'
        }
      },
      {
        headerName: 'Method',
        field: 'operation',
        minWidth: 140,
        refData: {
          filterType: 'list_of_values',
          mapperFunction: 'gridMethodMapper'
        }
      },
      {
        headerName: 'Status',
        field: 'statusCode',
        refData: {
          filterType: 'number'
        }
      },
      {
        headerName: 'RecordId',
        field: 'reqBody._id',
        refData: {
          filterType: 'text'
        }
      },
      {
        headerName: 'User',
        field: 'userId',
        refData: {
          filterType: 'text'
        }
      },
      {
        headerName: 'RemoteIP',
        field: 'source',
        refData: {
          filterType: 'text'
        }
      },
      {
        headerName: 'URL',
        field: 'url',
        minWidth: 300,
        refData: {
          filterType: 'text'
        }
      }
    ];
    this.gridOptions = {
      defaultColDef,
      columnDefs,
      context: this,
      suppressColumnVirtualisation: true,
      animateRows: true,
      rowModelType: 'infinite',
      floatingFilter: true,
      cacheBlockSize: 30,
      overlayNoRowsTemplate: '<span>No records to display</span>',
      onGridReady: this.onGridReady.bind(this),
      onRowDataChanged: this.autoSizeAllColumns.bind(this),
      onGridSizeChanged: this.forceResizeColumns.bind(this),
      onRowDoubleClicked: this.onRowDoubleClick.bind(this),
    };
  }

  gridDSNameMapper(data: Array<any>) {
    return this.dataservices;
  }

  gridMethodMapper(data: Array<any>) {
    return this.operationType;
  }

  private onGridReady(params?) {
    this.gridApi = params.api;
    this.getRecords();
    this.forceResizeColumns();
  }

  private autoSizeAllColumns() {
    if (!!this.agGrid.api && !!this.agGrid.columnApi) {
      setTimeout(() => {
        const container = document.querySelector('.grid-container');
        const availableWidth = !!container ? container.clientWidth : 1154;
        this.agGrid.columnApi.autoSizeAllColumns();
        const allColumns = this.agGrid.columnApi.getAllColumns();
        const occupiedWidth = allColumns.reduce((pv, cv) => pv + cv.getActualWidth(), 0);
        if (occupiedWidth < availableWidth) {
          this.agGrid.api.sizeColumnsToFit();
        }
      }, 2000);
    }
  }

  private forceResizeColumns() {
    this.agGrid.api.sizeColumnsToFit();
    setTimeout(() => {
      this.autoSizeAllColumns();
    });
  }

  private onRowDoubleClick(evt) {
    const self = this;
    self.selectedLog = evt.data;
    try {
      if (self.selectedLog && self.selectedLog.data && self.selectedLog.data.old && typeof self.selectedLog.data.old === 'string') {
        self.selectedLog.data.old = JSON.parse(self.selectedLog.data.old);
      }
      if (self.selectedLog && self.selectedLog.data && self.selectedLog.data.new && typeof self.selectedLog.data.new === 'string') {
        self.selectedLog.data.new = JSON.parse(self.selectedLog.data.new);
      }
    } catch (e) {
      console.error('Error Parsing posthook JSON', e);
    }
    self.showDetail = true;
    this.htmlContent = JSON.stringify(this.selectedLog.reqBody, null, 4);
  }

  activateTab(tab) {
    const self = this;
    self.activeTab = tab;
    if (tab === 1) {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } else {
      this.myScrollContainer.nativeElement.scrollTop = 0;
    }
  }

  getRecords() {
    const self = this;

    self.dataSource = {
      getRows: (params: IGetRowsParams) => {
        this.getRowsDebounceSubject.next(params);
      }
    };
  }
  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(key => {
      if (self.subscriptions[key]) {
        self.subscriptions[key].unsubscribe();
      }
    });
  }

  private getRows(params: IGetRowsParams) {
    const self = this;
    this.apiConfig.page = Math.ceil(params.endRow / 30);
    if (this.apiConfig.page === 1) {
      this.loaded = 0;
    }
    if (!self.apiConfig.filter) {
      self.apiConfig.filter = {
        app: self.commonService.app._id,
      };
    }
    const filterModel = self.agGrid?.api?.getFilterModel();
    const filterModelKeys = Object.keys(filterModel || {});
    if (!!filterModelKeys.length) {
      self.apiConfig.filter.$and = filterModelKeys.map(key => {
        if (typeof filterModel[key].filter === 'string') {
          filterModel[key].filter =
            filterModel[key].filter.charAt(0) === '{' ? JSON.parse(filterModel[key].filter) : { [key]: filterModel[key].filter };
        }
        return filterModel[key].filter;
      });
      if (!filterModelKeys.includes('operation')) {
        self.apiConfig.filter.$and.push({ operation: { $in: self.operationType.filter(op => !!op.checked).map(op => op.value) } });
      }
    } else {
      self.apiConfig.filter.$and = [{ operation: { $in: self.operationType.filter(op => !!op.checked).map(op => op.value) } }];
    }
    self.apiConfig.sort = this.appService.getSortFromModel(this.agGrid?.api?.getSortModel() || [])
    self.agGrid.api.showLoadingOverlay();

    if (self.subscriptions['getRecords_data']) {
      self.subscriptions['getRecords_data'].unsubscribe();
    }
    self.subscriptions['getRecords_data'] = self.commonService
      .get('log', `/mon/dataService/log` + '/count', { filter: self.apiConfig.filter, noApp: true })
      .pipe(
        switchMap(count => {
          self.currentRecordsCount = count;
          return !!count ? self.commonService.get('log', `/mon/dataService/log`, self.apiConfig) : of(null);
        })
      ).subscribe(
        data => {
          if (!!data) {
            this.loaded += data.length;
            if (this.loaded < this.currentRecordsCount) {
              params.successCallback(data);
            } else {
              this.currentRecordsCount = this.loaded;
              params.successCallback(data, this.currentRecordsCount);
            }

          } else {
            params.successCallback([], 0);
          }
          self.showDetail = false;
          self.activeTab = 0
          this.agGrid?.api?.hideOverlay();
        },
        err => {
          this.agGrid?.api?.hideOverlay();
          console.error(err);
          params.failCallback();
          self.commonService.errorToast(err, 'Unable to fetch logs');
        }
      );
  }

  getKeys(obj) {
    return Object.keys(obj);
  }
  showObject() {
    const self = this;
    self.selectedLog = self.selectedLog;
    try {
      if (self.selectedLog && self.selectedLog.data && self.selectedLog.data.old && typeof self.selectedLog.data.old === 'string') {
        self.selectedLog.data.old = JSON.parse(self.selectedLog.data.old);
      }
      if (self.selectedLog && self.selectedLog.data && self.selectedLog.data.new && typeof self.selectedLog.data.new === 'string') {
        self.selectedLog.data.new = JSON.parse(self.selectedLog.data.new);
      }
    } catch (e) {
      console.error('Error Parsing posthook JSON', e);
    }
    if (Object.keys(self.selectedLog.reqBody).length > 0) {
      self.logModalRef = self.commonService.modal(self.logModal, { windowClass: 'preHook-preview-modal' });
      self.logModalRef.result.then(
        close => { },
        dismiss => { }
      );
    }
  }

  getAllDataServices() {
    const self = this;
    let options = {
      app: this.commonService.app._id,
      select: 'name',
      count: -1
    };
    self.subscriptions['getservice'] = self.commonService.get('serviceManager', '/service', options).subscribe(
      res => {
        self.dataservices = res.map(itm => ({ value: itm._id, label: itm.name }));
      },
      err => {
        self.commonService.errorToast(err, 'We are unable to fetch  service records, please try again later');
      }
    );
  }

  nameFormatter(params) {
    let retValue = '';
    let value;
    if (params.value) {
      value = params.value;
    } else {
      value = params;
    }

    let dataservice = this.dataservices.find(e => e.value === value);
    if (dataservice) {
      retValue = dataservice.label;
    }
    return retValue;
  }

  getValue(val) {
    const self = this;
    let retVal = 'NA';
    if (self.selectedLog['reqBody'][val]) {
      retVal = self.selectedLog['reqBody'][val];
    }
    return retVal;
  }

  isStringValue(val) {
    const self = this;
    let retVal = false;
    if (!self.selectedLog['reqBody'][val] || typeof self.selectedLog['reqBody'][val] === 'string') {
      retVal = true;
    }
    return retVal;
  }
  copyFormat() {
    const self = this;
    const copyText = document.getElementById('requestData') as HTMLInputElement;
    const textArea = document.createElement('textarea');
    textArea.textContent = JSON.stringify(JSON.parse(copyText.innerText), null, 4);
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    setTimeout(() => {
      this.tooltip.close();
    }, 1500);
  }
}
