import { Component, OnInit, ViewChild, ElementRef, OnDestroy, TemplateRef } from '@angular/core';
import { IDatasource, IGetRowsParams, GridApi, GridOptions, ColDef } from 'ag-grid-community';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

import { CommonService } from 'src/app/utils/services/common.service';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { AgGridCellComponent } from './ag-grid-cell/ag-grid-cell.component';
import { AgGridSharedFloatingFilterComponent } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.component';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-dataservice-logs',
  templateUrl: './dataservice-logs.component.html',
  styleUrls: ['./dataservice-logs.component.scss']
})
export class DataserviceLogsComponent implements OnInit, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @ViewChild('agGrid', { static: false }) agGrid: AgGridAngular;
  @ViewChild('logModal', { static: false }) logModal: TemplateRef<any>;
  @ViewChild('hookModal', { static: false }) hookModal: TemplateRef<any>;
  public gridApi: GridApi;
  public gridOptions: GridOptions;
  logModalRef: NgbModalRef;
  hookModalRef: NgbModalRef;
  subscriptions: any;
  showLazyLoader: boolean;
  apiConfig: APIConfig;
  selectedLog: any;
  showDetail: boolean;
  activeTab: number;
  rowData: Array<any>;
  resMappings: any;
  logTypesList: Array<any>;
  responseType: any;
  showResponseOptions: boolean;
  paginationPageSize = 30;
  filterModel: any;
  dataSource: IDatasource;
  totalRecordsCount;
  currentRecordsCount;
  activeModalTab = 0;
  loaded: number;
  dataservices: Array<any>;
  noRowsTemplate;
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
    self.apiConfig.filter = {};
    self.subscriptions = {};
    self.activeTab = 0;
    self.logTypesList = ['ExperienceHook', 'PostHook', 'PreHook', 'WorkflowHook'].map(value => ({ value }));
    self.dataservices = [];
    self.noRowsTemplate = '<span>No records to display</span>';
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
    };
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
      floatingFilterComponentFramework: AgGridSharedFloatingFilterComponent
    };
    const columnDefs: Array<ColDef> = [
      {
        headerName: 'Date and Time',
        field: '_metadata.createdAt',
        minWidth: 270,
        refData: {
          filterType: 'date-time',
          timezone: 'Zulu'
        }
      },
      {
        headerName: 'Data Service',
        field: 'service.name',
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
        headerName: 'Type',
        field: 'type',
        minWidth: 140,
        refData: {
          filterType: 'list_of_values',
          mapperFunction: 'gridTypeMapper'
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
        field: 'docId',
        refData: {
          filterType: 'text'
        }
      },
      {
        headerName: 'User',
        field: 'user',
        refData: {
          filterType: 'text'
        }
      },
      {
        headerName: 'Retry',
        field: 'retry',
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
      onRowDoubleClicked: this.onRowDoubleClick.bind(this)
    };
    this.dataSource = {
      getRows: (params: IGetRowsParams) => {
        this.getRowsDebounceSubject.next(params);
      }
    };
  }

  gridDSNameMapper(data: Array<any>) {
    return this.dataservices;
  }

  gridTypeMapper(data: Array<any>) {
    return this.logTypesList;
  }

  private onGridReady(params?) {
    this.gridApi = params.api;
    this.forceResizeColumns();
  }

  private autoSizeAllColumns() {
    if (!!this.agGrid.api && !!this.agGrid.columnApi) {
      setTimeout(() => {
        const container = document.querySelector('.grid-container');
        const availableWidth = !!container ? container.clientWidth : 1154;
        this.agGrid.columnApi.autoSizeAllColumns();
        const allColumns = this.agGrid.columnApi.getAllColumns() || [];
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

  getRows(params: IGetRowsParams) {
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
    } else {
      delete self.apiConfig.filter.$and;
    }
    self.apiConfig.sort = this.appService.getSortFromModel(this.agGrid?.api?.getSortModel() || [])
    self.agGrid.api.showLoadingOverlay();
    if (self.subscriptions['getRecords_data']) {
      self.subscriptions['getRecords_data'].unsubscribe();
    }
    self.subscriptions['getRecords_data'] = self.commonService
      .get('log', `/mon/${this.commonService.app._id}/hooks/count`, { filter: self.apiConfig.filter, noApp: true })
      .pipe(
        switchMap(count => {
          self.currentRecordsCount = count;
          return !!count ? self.commonService.get('log', `/mon/${this.commonService.app._id}/hooks`, self.apiConfig) : of(null);
        })
      )
      .subscribe(
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
          this.agGrid?.api?.hideOverlay();
        },
        err => {
          this.agGrid?.api?.hideOverlay();
          params.failCallback();
          self.commonService.errorToast(err, 'Unable to fetch logs');
        }
      );
  }

  onRowDoubleClick(evt) {
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
    this.htmlContent = JSON.stringify(this.selectedLog, null, 4);
    self.showDetail = true;
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

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(key => {
      if (self.subscriptions[key]) {
        self.subscriptions[key].unsubscribe();
      }
    });
  }

  getKeys(obj) {
    return Object.keys(obj);
  }

  showHookObject() {
    const self = this;
    self.activeModalTab = 0;
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
    self.hookModalRef = self.commonService.modal(self.hookModal, { size: 'lg' });

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
        self.dataservices = res.map(itm => ({ value: itm.name, label: itm.name }));
      },
      err => {
        self.commonService.errorToast(err, 'We are unable to fetch  service records, please try again later');
      }
    );
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

  clearFilters() {
    this.agGrid.api.setFilterModel({});
  }

  get showClearFilter() {
    if (this.agGrid?.api) {
      const model = this.agGrid.api.getFilterModel();
      if (Object.keys(model).length > 0) {
        return true;
      }
    }
    return false;
  }

}
