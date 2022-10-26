import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CommonService } from 'src/app/utils/services/common.service';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { LogsService } from 'src/app/home/logs/logs.service';
import { AppService } from 'src/app/utils/services/app.service';
import { DataGridColumn } from 'src/app/utils/data-grid/data-grid.directive';

@Component({
    selector: 'odp-api-logs',
    templateUrl: './api-logs.component.html',
    styleUrls: ['./api-logs.component.scss']
})
export class ApiLogsComponent implements OnInit, OnDestroy {

    @ViewChild('logModal', { static: false }) logModal: TemplateRef<any>;
    logModalRef: NgbModalRef;
    tableColumns: Array<DataGridColumn>;
    subscriptions: any;
    apiConfig: APIConfig;
    totalCount: number;
    currentCount: number;
    logs: Array<any>;
    selectedLog: any;
    showLazyLoader: boolean;
    @Input() service: any;
    @Output() columnsChange: EventEmitter<any>;
    @Output() filtersChange: EventEmitter<any>;
    value: string;
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    userList: Array<any>;

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
        self.showLazyLoader = true;
        self.tableColumns = [];
        self.currentPage = 1;
        self.pageSize = 30;
        self.totalRecords = 0;
    }

    _columns: any;

    @Input() set columns(val: any) {
        this._columns = val;
    }

    _filters: any;

    @Input() set filters(val: any) {
        this._filters = val;

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

    get hasMoreRecords() {
        const self = this;
        return self.totalCount !== self.logs.length;
    }

    ngOnInit() {
        const self = this;
        self._columns = {
            url: {
                show: true,
                label: 'URL',
                searchField: 'url'
            },
            method: {
                show: true,
                label: 'Method',
                searchField: 'method'
            },
            user: {
                show: true,
                label: 'User',
                searchField: 'userId'
            },
            dia: {
                show: true,
                label: 'Diagnostics'
            },
            txind: {
                show: true,
                label: 'Transaction ID',
                searchField: 'txnid'
            },
            ip: {
                show: true,
                label: 'IP',
                searchField: 'source'
            },
            rescode: {
                show: true,
                label: 'Response Code',
                searchField: 'resStatusCode'
            },
            timestamp: {
                show: true,
                label: 'TimeStamp',
                dateField: 'timestamp'
            }
        };
        self.tableColumns.push({
            show: true,
            label: 'ID',
            dataKey: '_id',
            width: 50
        },
            {
                show: true,
                label: 'URL',
                dataKey: 'url',
                width: 250
            },
            {
                show: true,
                label: 'Method',
                dataKey: 'method',
                width: 100
            },
            {
                show: true,
                label: 'User',
                dataKey: 'userId',
                width: 150

            },
            {
                show: true,
                label: 'Diagnostics',
                dataKey: 'Diagnostics',
                width: 100
            },
            {
                show: true,
                label: 'Transaction ID',
                dataKey: 'txnid',
                width: 115
            },
            {
                show: true,
                label: 'IP',
                dataKey: 'source',
                width: 120
            },
            {
                show: true,
                label: 'Response Code',
                dataKey: 'resStatusCode',
                width: 100
            },
            {
                show: true,
                label: 'TimeStamp',
                dataKey: 'timestamp',
                width: 200
            });
        self.columnsChange.emit(self._columns);
        self.getCount(true);
        self.clearSearch();
        self.subscriptions['applyFilter'] = self.logsService.applyFilter.subscribe(filters => {
            if (filters) {
                self.search(filters);
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
        self.subscriptions['getlogs']
            = self.commonService.get('log', '/mon/appCenter/' + self.service._id + '/logs', self.apiConfig).subscribe(d => {
                self.showLazyLoader = false;
                if (d.length > 0) {
                    d.forEach(val => {
                        val['url'] = decodeURIComponent(val.url);
                        self.logs.push(val);
                    });
                }
                self.userList = self.logs.map(e => e.userId);
                self.userList = self.userList.filter((e, index) => self.userList.indexOf(e) === index);
                self.getUsers();
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
            self.commonService.get('log', '/mon/appCenter/' + self.service._id + '/logs/count', options).subscribe(count => {
                self.showLazyLoader = false;
                self.totalCount = count;
                self.totalRecords = count;

            }, err => {
                self.commonService.errorToast(err, 'Unable to fetch log count');
            });
    }

    sortSelected(model: any) {
        const self = this;
        self.apiConfig.sort = self.appService.getSortQuery(model);
        self.apiConfig.page = 1;
        self.logs = [];
        self.getRecords();
        self.getCount();
    }

    loadMore(event) {
        const self = this;
        self.logs = [];
        self.apiConfig.page = event.page;
        self.getRecords();
    }

    clearFilter() {
        const self = this;
        self.value = '';
        self.apiConfig.filter = {};
        self.apiConfig.page = 1;
        self.logs = [];
        self.getRecords();
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
        self.currentPage = 1;
        self.getCount();
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

    getKeys(obj) {
        return Object.keys(obj);
    }

    showObject(index) {
        const self = this;
        self.selectedLog = self.logs[index];
        if (Object.keys(self.selectedLog.reqBody).length > 0) {
            self.logModalRef = self.commonService.modal(self.logModal);
            self.logModalRef.result.then((close) => { }, dismiss => { });
        }

    }

    searchTransactionId(txnid) {
        const self = this;
        self.logsService.searchPostHookLog.emit(txnid);
    }

    getUsers() {
        const self = this;
        if (self.subscriptions['getUserList']) {
            self.subscriptions['getUserList'].unsubscribe();
        }
        const options = {
            filter: { _id: { $in: self.userList } },
            count: -1,
            noApp: true
        };
        self.showLazyLoader = true;
        self.subscriptions['getUserList'] = self.commonService.get('user', `/${this.commonService.app._id}/user`, options)
            .subscribe((users) => {
                self.showLazyLoader = false;
                if (users.length > 0) {
                    self.userList = users;
                }
            }, (err) => {
                self.showLazyLoader = false;
                self.commonService.errorToast(err, 'Unable to fetch users');
            });
    }

    getUserName(userId) {
        const self = this;
        let retVal;
        const user = self.userList.find(usr => usr._id === userId);
        if (user) {
            retVal = user['basicDetails'].name;
        }
        return retVal;
    }
}
