import { Component, OnInit } from '@angular/core';
import { InsightService } from 'src/app/home/insight/insight.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { CommonService } from 'src/app/utils/services/common.service';


@Component({
    selector: 'odp-insight',
    templateUrl: './insight.component.html',
    styleUrls: ['./insight.component.scss']
})
export class InsightComponent implements OnInit {

    activeTab: number;
    showColumns: boolean;
    showFilters: boolean;
    private _filters: any;
    private _columns: any;
    subscriptions: any;
    searchModel: any;
    filterModel: any;
    private _dateFrom: Date;
    private _dateTo: Date;

    public get dateFrom(): Date {
        const self = this;
        return self._dateFrom;
    }
    public set dateFrom(value: Date) {
        const self = this;
        self._dateFrom = value;
        if (value) {
            self.filterModel.from = new Date(value);
        } else {
            delete self.filterModel.from;
        }
    }

    public get dateTo(): Date {
        const self = this;
        return self._dateTo;
    }
    public set dateTo(value: Date) {
        const self = this;
        self._dateTo = value;
        if (value) {
            self.filterModel.to = new Date(value);
        } else {
            delete self.filterModel.to;
        }
    }
    breadcrumbPaths: Array<Breadcrumb>;
    constructor(private insightService: InsightService,
        public commonService: CommonService) {
        const self = this;
        self.activeTab = 0;
        self.subscriptions = {};
        self.searchModel = { field: 'summary' };
        self.filterModel = {};
        self.breadcrumbPaths = [];
        self.dateFrom = new Date();
        self.dateFrom.setDate(self.dateFrom.getDate() - 1);
        self.dateTo = new Date();
    }

    ngOnInit() {
        const self = this;
        self.showFilters = false;
        self.breadcrumbPaths.push({
            active: true,
            label: 'Insights'
        });
        self.searchModel.field = 'summary';
        this.setActiveTab();
        // self.subscriptions['userLogs'] = self.insightService.searchUserLog.subscribe(_txnId => {
        //     self.filters = { 'data.txnId': _txnId };
        //     self.insightService.userLogFilter = self.filters;
        //     self.searchModel.field = 'summary';
        //     self.searchModel.term = _txnId;
        //     self.activeTab = 2;
        // });
    }
    setActiveTab() {
        if (this.hasDsPermission) {
            this.activeTab = 0;
        } else if (this.hasUserPermission) {
            this.activeTab = 1;
        } else {
            this.activeTab = 2;
        }
    }

    public get columns() {
        const self = this;
        return self._columns;
    }
    public set columns(value: any) {
        const self = this;
        self._columns = value;
    }

    public get filters() {
        const self = this;
        return self._filters;
    }
    public set filters(value: any) {
        const self = this;
        self._filters = value;
    }

    activateTab(index: number) {
        const self = this;
        self.activeTab = index;
        self.clearSearch();
    }

    get dateFields() {
        const self = this;
        const temp = [];
        if (self.columns) {
            Object.keys(self.columns).forEach(key => {
                if (self.columns[key].dateField) {
                    temp.push(self.columns[key]);
                }
            });
        }
        if (temp.length > 0) {
            self.filterModel.field = temp[0].dateField;
        }
        return temp;
    }

    clearSearch() {
        const self = this;
        self.filters = null;
        self.searchModel.term = '';
        self.searchModel.field = 'summary';
        self.insightService.applyFilter.emit(self.filters);
    }

    get searchOptions() {
        const self = this;
        const temp = [];
        if (self.columns) {
            Object.keys(self.columns).forEach(key => {
                if (self.columns[key].searchField) {
                    temp.push(self.columns[key]);
                }
            });
        }
        return temp;
    }

    clearSearchWithDate() {
        const self = this;
        self.dateTo = null;
        self.dateFrom = null;
        if (self.filters) {
            delete self.filters[self.filterModel.field];
            if (Object.keys(self.filters).length === 0) {
                self.filters = null;
            }
            self.insightService.applyFilter.emit(self.filters);
        }
    }

    searchWithDate() {
        const self = this;
        if (self.filterModel.from || self.filterModel.to) {
            if (!self.filters) {
                self.filters = {};
            }
            if (self.filterModel.from) {
                const formDate = new Date(self.filterModel.from);
                formDate.setMilliseconds(0);
                if (!self.filters[self.filterModel.field]) {
                    self.filters[self.filterModel.field] = {};
                }
                self.filters[self.filterModel.field]['$gte'] = formDate.toISOString();
            }
            if (self.filterModel.to) {
                const toDate = new Date(self.filterModel.to);
                toDate.setMilliseconds(0);
                if (!self.filters[self.filterModel.field]) {
                    self.filters[self.filterModel.field] = {};
                }
                self.filters[self.filterModel.field]['$lte'] = toDate.toISOString();
            }
            self.insightService.applyFilter.emit(self.filters);
        }
        self.showFilters = false;
    }

    checkSearch(event: KeyboardEvent) {
        const self = this;
        if (self.searchModel.term && event.key === 'Enter') {
            self.search();
            return;
        }
        if (self.filters && !self.searchModel.term) {
            self.clearSearch();
        }
    }

    getKeys(obj) {
        if (obj) {
            return Object.keys(obj);
        }
        return [];
    }

    search() {
        const self = this;
        if (!self.filters) {
            self.filters = {};
        }
        self.filters[self.searchModel.field] = '/' + self.searchModel.term + '/';
        self.insightService.applyFilter.emit(self.filters);
    }

    get hasDsPermission() {
        const self = this;
        return self.commonService.hasPermission('PVISDS')
    }

    get hasUserPermission() {
        const self = this;
        return self.commonService.hasPermission('PVISU');
    }
    
    get hasGroupsPermission() {
        const self = this;
        return self.commonService.hasPermission('PVISG');
    }
}
