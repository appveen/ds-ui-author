import { Component, OnInit, ViewChild, ElementRef, OnDestroy, TemplateRef } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { AgGridColumn, AgGridAngular } from 'ag-grid-angular';
import { AgGridFiltersComponent } from './ag-grid-filters/ag-grid-filters.component';
import { IDatasource, IGetRowsParams, GridApi, GridOptions } from 'ag-grid-community';
import { map } from 'rxjs/operators';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgGridCellComponent } from './ag-grid-cell/ag-grid-cell.component';
import { environment } from 'src/environments/environment';

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
  columns: Array<any>;
  columnDefs;
  resMappings: any;
  logtype: any;
  responseType: any;
  operationType: any;
  showLogOptions: boolean;
  showResponseOptions: boolean;
  showOperationOptions: boolean
  showDsOptions: boolean;
  paginationPageSize = 30;
  filterModel: any;
  dataSource: IDatasource;
  currentRecordsCountPromise: Promise<any>;
  totalRecordsCount;
  currentRecordsCount;
  activeModalTab = 0;
  loaded: number;
  dataservices: Array<any>;
  noRowsTemplate;
  constructor(
    private commonService: CommonService,
  ) {
    const self = this;
    self.showLazyLoader = false;
    self.apiConfig = {};
    self.apiConfig = {
      count: 30,
      page: 1,
      noApp: true
    };
    self.apiConfig.filter = {
      app: self.commonService.app._id
    }
    self.subscriptions = {};
    self.activeTab = 0;
    self.columnDefs = [];
    self.columns = [{
      headerName: 'TIME', field: '_metadata.createdAt',
    },
    {
      headerName: 'RESPONSE', field: 'statusCode'
    },
    {
      headerName: 'TRANSACTION ID', field: 'txnId'
    },
    {
      headerName: 'REQUESTED URL', field: 'url'
    },
    {
      headerName: 'USER', field: 'userId'
    },
    {
      headerName: 'REMOTE IP', field: 'source'

    },
    {
      headerName: 'OPERATION', field: 'sooperationurce'

    }];
    self.logtype = {
      "api": true,
      "postHook": true,
      "preHook": true,
    }
    self.responseType = {
      "200": true,
      "400": true,
      "500": true
    }
    self.operationType = {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    }
    self.dataservices = [];
    self.noRowsTemplate ='<span>No records to display</span>';
  }

  ngOnInit(): void {
    const self = this;
    self.buildColumns();
    self.getRecordsCount();
    self.getAllDataServices();
    
  }

  buildColumns() {
    const self = this;
    self.columnDefs = [{

      headerName: 'TIME', field: '_metadata.createdAt',
      filter: 'agTextColumnFilter', headerClass: 'hide-filter-icon', filterParams: {
        caseSensitive: true,
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
      suppressMenu: true,
      floatingFilterComponentFramework: AgGridFiltersComponent,
      cellRendererFramework: AgGridCellComponent,
      sortable: true
    },
    {
      headerName: 'RESPONSE', field: 'statusCode',
      filter: 'agTextColumnFilter', headerClass: 'hide-filter-icon', filterParams: {
        caseSensitive: true,
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
      suppressMenu: true,
      floatingFilterComponentFramework: AgGridFiltersComponent,
      cellRendererFramework: AgGridCellComponent,
      sortable: true

    },
    {
      headerName: 'DATA SERVICE', field: 'serviceId',
      headerClass: 'hide-filter-icon', filterParams: {
        caseSensitive: true,
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
      suppressMenu: true,
      valueFormatter: this.nameFormatter.bind(this),
      sortable: true
    },
    {
      headerName: 'LOG TYPE', field: 'logType',
      suppressMenu: true,
      floatingFilterComponentFramework: AgGridFiltersComponent,
      sortable: true
    },

    {
      headerName: 'TRANSACTION ID', field: 'txnId',
      filter: 'agTextColumnFilter', headerClass: 'hide-filter-icon', filterParams: {
        caseSensitive: true,
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
      floatingFilterComponentFramework: AgGridFiltersComponent,
      suppressMenu: true,
      cellRendererFramework: AgGridCellComponent,
      sortable: true
    },

    {
      headerName: 'RECORD ID', field: 'docId',
      filter: 'agTextColumnFilter', headerClass: 'hide-filter-icon', filterParams: {
        caseSensitive: true,
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
      floatingFilterComponentFramework: AgGridFiltersComponent,
      suppressMenu: true,
      cellRendererFramework: AgGridCellComponent,
      sortable: true
    },

    {
      headerName: 'Retry', field: 'retry',
      filter: 'agTextColumnFilter', headerClass: 'hide-filter-icon', filterParams: {
        caseSensitive: true,
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
      floatingFilterComponentFramework: AgGridFiltersComponent,
      suppressMenu: true,
      cellRendererFramework: AgGridCellComponent,
      sortable: true
    },

    {
      headerName: 'USER', field: 'userId',
      filter: 'agTextColumnFilter', headerClass: 'hide-filter-icon', filterParams: {
        caseSensitive: true,
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
      floatingFilterComponentFramework: AgGridFiltersComponent,
      suppressMenu: true,
      sortable: true


    },
    {
      headerName: 'REMOTE IP', field: 'source',
      filter: 'agTextColumnFilter', headerClass: 'hide-filter-icon', filterParams: {
        caseSensitive: true,
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
      floatingFilterComponentFramework: AgGridFiltersComponent,
      suppressMenu: true,
      sortable: true



    },
    {
      headerName: 'OPERATION', field: 'operation',
      floatingFilterComponentFramework: AgGridFiltersComponent,
      suppressMenu: true,
      sortable: true


    },
    {
      headerName: 'REQUESTED URL', field: 'url',
      filter: 'agTextColumnFilter', headerClass: 'hide-filter-icon', filterParams: {
        caseSensitive: true,
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
      floatingFilterComponentFramework: AgGridFiltersComponent,
      suppressMenu: true,
      sortable: true

    }];
  }

  configureGridSettings(): void {
    this.gridOptions = {
      enableFilter: true,
      enableSorting: true,
      enableColResize: true,
      columnDefs: this.columnDefs,
      animateRows: true,
      headerHeight: 45,
      enableServerSideSorting: true,
      rowModelType: 'infinite'
    };
  }

  showDetails(evt) {
    const self = this;
    self.selectedLog = evt.data;
    console.log(self.selectedLog);
    try {
      if (self.selectedLog && self.selectedLog.data && self.selectedLog.data.old
        && typeof self.selectedLog.data.old === 'string') {
        self.selectedLog.data.old = JSON.parse(self.selectedLog.data.old);
      }
      if (self.selectedLog && self.selectedLog.data && self.selectedLog.data.new
        && typeof self.selectedLog.data.new === 'string') {
        self.selectedLog.data.new = JSON.parse(self.selectedLog.data.new);
      }
    } catch (e) {
      console.error('Error Parsing posthook JSON', e);
    }
    self.showDetail = true;
  }
  activateTab(tab) {
    const self = this;
    self.activeTab = tab;
    if (tab === 1) {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;

    }
    else {
      this.myScrollContainer.nativeElement.scrollToBottom = this.myScrollContainer.nativeElement.scrollHeight;

    }
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  toggleLogOptions(evt) {
    const self = this;
    self.showLogOptions = true;
    self.showResponseOptions = false;
    self.showOperationOptions = false;
    evt.stopPropagation()
  }
  toggleResposeOptions(evt) {
    const self = this;
    self.showLogOptions = false;
    self.showOperationOptions = false;
    evt.stopPropagation()
  }
  toggleOperationOptions(evt) {
    const self = this;
    self.showLogOptions = false;
    self.showDsOptions = false;
    self.showOperationOptions = true;
    evt.stopPropagation()
  }

  toggleDsOptions(evt) {
    const self = this;
    self.showLogOptions = false;
    self.showOperationOptions = false;
    self.showDsOptions = true
    evt.stopPropagation()
  }


  filterChange(type) {
    const self = this;
    self.showLogOptions = false;
    self.showOperationOptions = false;
    let operationIndex = -1;
    let logTypeIndex = -1;
    let dataServiceIndex = -1;
    if (self.apiConfig && self.apiConfig.filter && !self.apiConfig.filter.$and) {
      self.apiConfig.filter.$and = [];
    }
    self.apiConfig.filter.$and.forEach((element, index) => {
      const keys = Object.keys(element);
      const indx = keys.findIndex(e => e === 'operation');
      if (indx > -1) {
        operationIndex = index;
      }
      const indx1 = keys.findIndex(e => e === 'logType');
      if (indx1 > -1) {
        logTypeIndex = index;
      }
      const indx2 = keys.findIndex(e => e === 'serviceId');
      if (indx2 > -1) {
        dataServiceIndex = index;
      }
    });
    const operationArray = [];
    const logTypeArray = [];
    const dataserviceArray = [];
    Object.keys(self.operationType).forEach(e => {
      if (self.operationType[e] === true) {
        operationArray.push(e);
      }
    });
    Object.keys(self.logtype).forEach(e => {
      if (self.logtype[e] === true) {
        logTypeArray.push(e);
      }
    });
    Object.keys(self.dataservices).forEach((e, index) => {
      if (self.dataservices[e].selected) {
        dataserviceArray.push(self.dataservices[index]._id);
      }
    });


    if (operationIndex > -1 && operationArray.length > 0) {
      self.apiConfig.filter.$and[operationIndex]['operation'] = { $in: operationArray };
    } else if (operationArray.length > 0) {
      self.apiConfig.filter.$and.push({ operation: { $in: operationArray } });
    } else if (operationIndex > -1) {
      self.apiConfig.filter.$and.splice(operationIndex, 1);
    }
    if (logTypeIndex > -1 && logTypeArray.length > 0) {
      self.apiConfig.filter.$and[logTypeIndex]['logType'] = { $in: logTypeArray };
    } else if (logTypeArray.length > 0) {
      self.apiConfig.filter.$and.push({ logType: { $in: logTypeArray } });
    } else if (logTypeIndex > -1) {
      self.apiConfig.filter.$and.splice(logTypeIndex, 1);
    }

    if (dataServiceIndex > -1 && dataserviceArray.length > 0) {
      self.apiConfig.filter.$and[dataServiceIndex]['serviceId'] = { $in: dataserviceArray };
    } else if (dataserviceArray.length > 0) {
      self.apiConfig.filter.$and.push({ serviceId: { $in: dataserviceArray } });
    } else if (dataServiceIndex > -1) {
      self.apiConfig.filter.$and.splice(dataServiceIndex, 1);
    }
    self.initRows();
  }

  filterModified(value) {
    const self = this;
    const filterModel = self.agGrid.api.getFilterModel();
    const filter = [];
    if (self.apiConfig.filter.$and) {
      self.apiConfig.filter.$and.forEach((element, index) => {
        const keys = Object.keys(element);
        const indx = keys.findIndex(e => e === 'operation');
        if (indx > -1) {
          filter.push(self.apiConfig.filter.$and[index]);
        }
        const indx1 = keys.findIndex(e => e === 'logType');
        if (indx1 > -1) {
          filter.push(self.apiConfig.filter.$and[index]);
        }
      });
    }
    if (filterModel) {
      Object.keys(filterModel).forEach(key => {
        try {
          if (filterModel[key].filter) {
            let parsedVal = JSON.parse(filterModel[key].filter);
            if (key === 'statusCode') {
              parsedVal.statusCode = parseInt(parsedVal.statusCode);
            }
            filter.push(parsedVal);
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
    if (self.apiConfig && self.apiConfig.filter && filter && !self.apiConfig.filter.$and) {
      self.apiConfig.filter.$and = [];
    }

    self.apiConfig.filter.$and = filter;

    if (!self.apiConfig.filter.$and.length) {
      delete self.apiConfig.filter.$and;
    }

   
    self.filterModel = self.apiConfig.filter;
    self.initRows();

  }

  onReady(params?) {
    this.gridApi = params.api;
    this.getRecords();
  }

  getRecords() {
    const self = this;

    self.dataSource = {
      getRows: (params: IGetRowsParams) => {
        const filter = this.gridApi.getFilterModel();
        const definitionList = self.agGrid.columnApi.getAllColumns().filter(e => e.isVisible()).map(e => e.getColDef().refData);
        self.agGrid.api.showLoadingOverlay();
        self.currentRecordsCountPromise.then(count => {
          if (params.endRow - 30 < self.currentRecordsCount) {
            self.apiConfig.page = Math.ceil(params.endRow / 30);
            if (self.subscriptions['getRecords_' + self.apiConfig.page]) {
              self.subscriptions['getRecords_' + self.apiConfig.page].unsubscribe();
            }
            self.subscriptions['getRecords_' + self.apiConfig.page] = self.commonService.get('log', `/mon/dataService/log`, self.apiConfig)
              .subscribe(_d => {
                self.loaded = params.endRow;
                if (self.loaded > self.currentRecordsCount) {
                  self.loaded = self.currentRecordsCount;
                }
                self.showLazyLoader = false;
                self.rowData = _d;
                self.agGrid.api.hideOverlay();
                if (!self.rowData.length) {
                  self.agGrid.api.showNoRowsOverlay();
                }
                if (self.loaded === self.currentRecordsCount) {
                  params.successCallback(self.rowData, self.currentRecordsCount);
                } else {
                  params.successCallback(self.rowData);
                }
              }, err => {
                self.showLazyLoader = false;
                self.commonService.errorToast(err, 'Unable to fetch logs');
              });
          } else {
            self.loaded = 0;
            self.agGrid.api.hideOverlay();
            if(!self.currentRecordsCount){
            self.agGrid.api.showNoRowsOverlay();
            }
            params.successCallback([], self.currentRecordsCount);
          }
        });
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

  getRecordsCount(first?: boolean) {
    const self = this;
    const filter = self.apiConfig.filter;
    self.currentRecordsCountPromise = self.commonService.get('log', `/mon/dataService/log` + '/count', { filter: filter, noApp: true }).pipe(
      map(count => {
        if (first) {
          self.totalRecordsCount = count;
        }
        self.currentRecordsCount = count;

        return count;
      })
    ).toPromise();
  }
  getKeys(obj) {
    return Object.keys(obj);
  }
  showObject() {
    const self = this;
    self.selectedLog = self.selectedLog;
    try {
      if (self.selectedLog && self.selectedLog.data && self.selectedLog.data.old
        && typeof self.selectedLog.data.old === 'string') {
        self.selectedLog.data.old = JSON.parse(self.selectedLog.data.old);
      }
      if (self.selectedLog && self.selectedLog.data && self.selectedLog.data.new
        && typeof self.selectedLog.data.new === 'string') {
        self.selectedLog.data.new = JSON.parse(self.selectedLog.data.new);
      }
    } catch (e) {
      console.error('Error Parsing posthook JSON', e);
    }
    if (Object.keys(self.selectedLog.reqBody).length > 0) {
      self.logModalRef = self.commonService.modal(self.logModal);
      self.logModalRef.result.then((close) => { }, dismiss => { });
    }

  }
  showHookObject() {
    const self = this;
    self.activeModalTab = 0;
    self.selectedLog = self.selectedLog;
    try {
      if (self.selectedLog && self.selectedLog.data && self.selectedLog.data.old
        && typeof self.selectedLog.data.old === 'string') {
        self.selectedLog.data.old = JSON.parse(self.selectedLog.data.old);
      }
      if (self.selectedLog && self.selectedLog.data && self.selectedLog.data.new
        && typeof self.selectedLog.data.new === 'string') {
        self.selectedLog.data.new = JSON.parse(self.selectedLog.data.new);
      }
    } catch (e) {
      console.error('Error Parsing posthook JSON', e);
    }
    self.hookModalRef = self.commonService.modal(self.hookModal, { size: 'lg' });
    self.hookModalRef.result.then((close) => { }, dismiss => { });
  }
  initRows(nocount?: boolean) {
    const self = this;
    if (!nocount) {
      self.getRecordsCount();
      self.getRecords();
    }
    self.apiConfig.page = 1;
  }

  clearLogType() {
    const self = this;
    self.logtype = {
      "api": false,
      "postHook": false,
      "preHook": false,
    }
  }
  clearOperations() {
    const self = this;
    self.operationType = {
      "GET": false,
      "POST": false,
      "PUT": false,
      "DELETE": false
    }
  }
  clearDs() {
    const self = this;
    self.dataservices.forEach(element => {
      element.selected = false;
    });
  }

  getAllDataServices() {
    const self = this;
    let options = {
      app: this.commonService.app._id,
      select: 'name',
      count: -1
    }
    self.subscriptions['getservice'] = self.commonService.get('serviceManager', '/service', options)
      .subscribe(res => {
        self.dataservices = res;
        self.dataservices.forEach(element => {
          element.selected = true;
        });
      }, (err => {
        self.commonService.errorToast(err, 'We are unable to fetch  service records, please try again later');
      }));

  }

  nameFormatter(params) {
    const self = this;
    let retValue = '';
    let value
    if (params.value) {
      value = params.value;
    }
    else {
      value = params;
    }

    let dataservice = self.dataservices.find(e => e._id === value);
    if (dataservice) {
      retValue = dataservice.name;
    }
    return retValue;
  }
  sortChanged(event) {
    const self = this;
    const sortModel = self.agGrid.api.getSortModel();
    let sort = '';
    if (sortModel) {
      sort = sortModel.map(e => (e.sort === 'asc' ? '' : '-') + e.colId).join(',');
    }
    self.apiConfig.sort = sort;
    if (!environment.production) {
      console.log('Sort Modified', sortModel);
    }
  }
  getValue(val) {
    const self = this;
    let retVal = 'NA';
    if (self.selectedLog['reqBody'][val]) {
      retVal = self.selectedLog['reqBody'][val]
    }
    return retVal;
  }

  isStringValue(val) {
    const self = this;
    let retVal = false;
    if (!self.selectedLog['reqBody'][val] || (typeof self.selectedLog['reqBody'][val] === 'string')) {
      retVal = true;
    }
    return retVal;
  }
}


