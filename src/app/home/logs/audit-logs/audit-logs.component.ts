import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as jsdiff from 'diff';

import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { CommonService } from 'src/app/utils/services/common.service';
import { LogsService } from 'src/app/home/logs/logs.service';
import { AppService } from 'src/app/utils/services/app.service';
import { DataGridColumn } from 'src/app/utils/data-grid/data-grid.directive';

@Component({
  selector: 'odp-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit, OnDestroy {

  @ViewChild('logModal', { static: false }) logModal: TemplateRef<any>;

  subscriptions: any;
  apiConfig: APIConfig;
  totalCount: number;
  currentCount: number;
  logs: Array<any>;
  selectedLog: any;
  jsonDiff: any;
  showLazyLoader: boolean;
  logModalRef: NgbModalRef;
  service: any;
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
    self.apiConfig.filter = {};
    self.logs = [];
    self.columnsChange = new EventEmitter();
    self.filtersChange = new EventEmitter();
    self._columns = {};
    self.totalCount = 0;
    self.tableColumns = [];
    self.pageSize = 30;
    self.currentPage = 1;
  }

  _columns: any;

  @Input() set columns(val: any) {
    this._columns = val;
  }
  @Input() set serviceObj(val: any) {
    const self = this;
    self.service = val;
    self.clearSearch();

  }

  _filters: any;

  @Input() set filters(val: any) {
    this._filters = val;
    /*if (val) {
      this.search(val);
    } else {
      this.clearSearch();
    }*/
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
    return self.currentPage === 1;
  }

  get disableNext() {
    const self = this;
    return self.totalRecords < self.recordsLoaded;
  }

  get recordsLoaded() {
    const self = this;
    return self.currentPage * self.pageSize;
  }

  ngOnInit() {
    const self = this;
    self._columns = {
      config: {
        show: true,
        label: 'Configuration',
      },
      timestamp: {
        show: true,
        label: 'TimeStamp',
        dateField: 'timestamp'
      }
    };
    self.tableColumns.push(
      {
        show: true,
        label: 'ID',
        dataKey: '_checkbox',
        width: 50
      },
      {
        show: true,
        label: 'TimeStamp',
        dataKey: 'timestamp',
        width: 250
      },
      {
        show: true,
        label: 'Configuration',
        dataKey: 'configuration',
        width: 100
      });
    self.columnsChange.emit(self._columns);
    self.clearSearch();
    self.subscriptions['applyFilter'] = self.logsService.applyFilter.subscribe(_filters => {
      if (_filters) {
        self.search(_filters);
      } else {
        self.clearSearch();
      }
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
    self.subscriptions['getlogs'] = self.commonService.get('log', `/mon/author/sm/audit`, self.apiConfig)
      .subscribe(_d => {
        self.showLazyLoader = false;
        if (_d.length > 0) {
          _d.forEach(_val => {
            self.logs.push(_val);
          });
        }
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'Unable to fetch logs');
      });
  }

  clearFilter() {
    const self = this;
    self.value = '';
    self.apiConfig.filter = {};
    self.apiConfig.filter['data._id'] = self.service._id;
    self.apiConfig.page = 1;
    self.logs = [];
    self.getRecords();
  }

  getCount(firstLoad?: boolean) {
    const self = this;
    if (!self.service._id) {
      return;
    }
    self.apiConfig.filter['data._id'] = self.service._id;

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
      self.commonService.get('log', `/mon/author/sm/audit/count`, options).subscribe(count => {
        self.showLazyLoader = false;
        self.totalCount = count;
        self.totalRecords = count;
      }, err => {
        self.commonService.errorToast(err, 'Unable to fetch log count');
      });
  }

  loadMore(event) {
    const self = this;
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
    filter['data._id'] = self.service._id;
    self.apiConfig.filter = filter;
    self.apiConfig.filter['data._id'] = self.service._id;
    self.apiConfig.page = 1;
    self.logs = [];
    self.getCount();
    self.currentPage = 1;
    self.getRecords();
  }

  clearSearch() {
    const self = this;
    if (!self.service._id) {
      return;
    }
    self.apiConfig.page = 1;
    self.apiConfig.filter = {};
    self.apiConfig.filter['data._id'] = self.service._id;
    self.logs = [];
    self.getCount();
    self.getRecords();
  }

  getKeys(obj) {
    return Object.keys(obj);
  }

  showObject(_index) {
    const self = this;
    self.selectedLog = self.logs[_index];
    const oldData = self.selectedLog.data.old;
    const newData = self.selectedLog.data.new;
    const diff1 = jsdiff.diffLines(JSON.stringify(oldData, null, 4), JSON.stringify(newData, null, 4));
    const fragment: HTMLElement = document.createElement('div');
    for (let i = 0; i < diff1.length; i++) {
      if (diff1[i].added && diff1[i + 1] && diff1[i + 1].removed) {
        const temp = diff1[i];
        diff1[i] = diff1[i + 1];
        diff1[i + 1] = temp;
      }
      let node;
      if (diff1[i].removed) {
        node = document.createElement('pre');
        node.classList.add('del');
        node.classList.add('mb-0');
        node.appendChild(document.createTextNode(diff1[i].value));
      } else if (diff1[i].added) {
        node = document.createElement('pre');
        node.classList.add('ins');
        node.classList.add('mb-0');
        node.appendChild(document.createTextNode(diff1[i].value));
      } else {
        node = document.createElement('pre');
        node.classList.add('mb-0');
        node.appendChild(document.createTextNode(diff1[i].value));
      }
      fragment.appendChild(node);
    }
    self.jsonDiff = fragment.innerHTML;
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
