import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { CommonService } from 'src/app/utils/services/common.service';
import { LogsService } from 'src/app/home/logs/logs.service';
import { AppService } from 'src/app/utils/services/app.service';
import { DataGridColumn } from 'src/app/utils/data-grid/data-grid.directive';

@Component({
  selector: 'odp-pre-hook-logs',
  templateUrl: './pre-hook-logs.component.html',
  styleUrls: ['./pre-hook-logs.component.scss']
})
export class PreHookLogsComponent implements OnInit, OnDestroy {

  @ViewChild('logModal', { static: false }) logModal: TemplateRef<any>;

  subscriptions: any;
  apiConfig: APIConfig;
  totalCount: number;
  currentCount: number;
  logs: Array<any>;
  selectedLog: any;
  showLazyLoader: boolean;
  logModalRef: NgbModalRef;
  @Input() service: any;
  activeModalTab: number;
  @Output() columnsChange: EventEmitter<any>;
  @Output() filtersChange: EventEmitter<any>;
  tableColumns: Array<DataGridColumn>;
  value: string;
  currentPage: number;
  pageSize: number;
  totalRecords: number;

  constructor(private commonService: CommonService,
    private appService: AppService,
    private logsService: LogsService) {
    const self = this;
    self.subscriptions = {};
    self.apiConfig = {};
    self.apiConfig.count = 30;
    self.apiConfig.noApp = true;
    self.apiConfig.sort = '-_metadata.lastUpdated';
    self.logs = [];
    self.columnsChange = new EventEmitter();
    self.filtersChange = new EventEmitter();
    self._columns = {};
    self.activeModalTab = 0;
    self.currentPage = 1;
    self.pageSize = 30;
    self.totalRecords = 0;
    self.tableColumns = [];
  }

  _columns: any;

  @Input() set columns(val: any) {
    this._columns = val;
  }

  _filters: any;

  @Input() set filters(val: any) {
    this._filters = val;
    
  }

  get hasMoreRecords() {
    const self = this;
    return self.totalCount !== self.logs.length;
  }

  get startNo() {
    const self = this;
    return (self.currentPage - 1) * self.pageSize + 1;
  }

  get endNo() {
    const self = this;
    const temp = self.currentPage * self.pageSize;
    if (self.totalRecords > temp) {
      return temp;
    }
    return self.totalRecords;
  }

  get disablePrev() {
    const self = this;
    if (self.currentPage === 1) {
      return true;
    }
    return false;
  }

  get disableNext() {
    const self = this;
    if (self.totalRecords < self.recordsLoaded) {
      return true;
    }
    return false;
  }

  get recordsLoaded() {
    const self = this;
    return self.currentPage * self.pageSize;
  }

  ngOnInit() {
    const self = this;
    self._columns = {
      name: {
        show: true,
        label: 'Name',
        searchField: 'name'
      },
      docId: {
        show: true,
        label: 'ID',
        searchField: 'docId'
      },
      url: {
        show: true,
        label: 'Pre-Hook URL',
        searchField: 'url'
      },
      dia: {
        show: true,
        label: 'Diagnostics'
      },
      _createdAt: {
        show: true,
        label: 'Started At',
        dateField: '_metadata.createdAt'
      },
      _lastUpdated: {
        show: true,
        label: 'Finished At',
        dateField: '_metadata.lastUpdated'
      },
      status: {
        show: true,
        label: 'Status'
      }
    };
    self.columnsChange.emit(self._columns);
    self.getCount(true);
    self.clearSearch();
    self.subscriptions['applyFilter'] = self.logsService.applyFilter.subscribe(_filters => {
      if (_filters) {
        self.search(_filters);
      } else {
        self.clearSearch();
      }
    });
    self.tableColumns.push({
      show: true,
      label: 'S.No.',
      dataKey: '_id',
      width: 50
    },
      {
        show: true,
        label: 'Name',
        dataKey: 'name',
        width: 150
      },
      {
        show: true,
        label: 'ID',
        dataKey: 'docId',
        width: 100
      },
      {
        show: true,
        label: 'Pre-Hook URL',
        dataKey: 'url',
        width: 200

      },
      {
        show: true,
        label: 'Started At',
        dataKey: '_metadata.createdAt',
        width: 200
      },
      {
        show: true,
        label: 'Finished At',
        dataKey: '_metadata.lastUpdated',
        width: 200
      },
      {
        show: true,
        label: 'Status',
        dataKey: 'status',
        width: 150
      },
      {
        show: true,
        label: 'Diagnostics',
        dataKey: 'diagnostics',
        width: 200
      });
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(key => {
      if (self.subscriptions[key]) {
        self.subscriptions[key].unsubscribe();
      }
    });
    if (self.logModalRef) {
      self.logModalRef.close();
    }
  }

  getRecords() {
    const self = this;
    self.showLazyLoader = true;
    if (self.subscriptions['getlogs']) {
      self.subscriptions['getlogs'].unsubscribe();
    }
    self.subscriptions['getlogs'] = self.commonService.get('log', `/mon/appCenter/${self.service._id}/preHook`, self.apiConfig)
      .subscribe(_d => {
        self.showLazyLoader = false;
        if (_d.length > 0) {
          _d.forEach(_val => {
            _val['url'] = decodeURIComponent(_val.url);
            self.logs.push(_val);
          });
        }
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'Unable to fetch logs');
      });
  }

  getCount(firstLoad?: boolean) {
    const self = this;
    const options = JSON.parse(JSON.stringify(self.apiConfig));
    self.showLazyLoader = true;
    if (firstLoad) {
      if (self.subscriptions['getlogsCountFirst']) {
        self.subscriptions['getlogsCountFirst'].unsubscribe();
      }
    
    } else {
      if (self.subscriptions['getlogsCount']) {
        self.subscriptions['getlogsCount'].unsubscribe();
      }
    }
    self.subscriptions[firstLoad ? 'getlogsCountFirst' : 'getlogsCount'] =
      self.commonService.get('log', `/mon/appCenter/${self.service._id}/preHook/count`, options).subscribe(count => {
        self.showLazyLoader = false;
        self.totalCount = count;
        self.totalRecords = count;
       
      }, err => {
        self.commonService.errorToast(err, 'Unable to fetch log count');
      });
  }

  loadMore(event) {
    const self = this;
    self.logs = [];
    self.apiConfig.page = event.page;
    self.getRecords();
  }

  sortSelected(model: any) {
    const self = this;
    self.apiConfig.sort = self.appService.getSortQuery(model);
    self.apiConfig.page = 1;
    self.logs = [];
    self.getRecords();
    self.getCount();
  }

  sort(field) {
    const self = this;
    self.apiConfig.sort = field;
    self.apiConfig.page = 1;
    self.logs = [];
    self.getRecords();
  }

  search(filter) {
    const self = this;
    self.apiConfig.filter = filter;
    self.apiConfig.page = 1;
    self.logs = [];
    self.getCount();
    self.currentPage = 1;
    self.getRecords();
  }

  clearSearch() {
    const self = this;
    self.apiConfig.page = 1;
    self.apiConfig.filter = {};
    self.logs = [];
    self.getCount();
    self.getRecords();
  }

  getKeys(obj) {
    return Object.keys(obj);
  }

  showObject(index) {
    const self = this;
    self.activeModalTab = 0;
    self.selectedLog = self.logs[index];
    self.logModalRef = self.commonService.modal(self.logModal, { size: 'lg' });
    self.logModalRef.result.then((close) => { }, dismiss => { });
  }

  prevPage() {
    const self = this;
    self.currentPage -= 1;
    self.loadMore({
      page: self.currentPage
    });
  }

  nextPage() {
    const self = this;
    self.currentPage += 1;
    self.loadMore({
      page: self.currentPage
    });
  }
}
