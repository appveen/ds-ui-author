import { IDatasource, IGetRowsParams, GridOptions, ColDef } from 'ag-grid-community';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { switchMap } from 'rxjs/operators';
import * as momentTz from 'moment-timezone';
import { of } from 'rxjs';

import { CommonService } from 'src/app/utils/services/common.service';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { AgGridSharedFloatingFilterComponent } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.component';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
    selector: 'odp-user-logs',
    templateUrl: './user-logs.component.html',
    styleUrls: ['./user-logs.component.scss']
})
export class UserLogsComponent implements OnInit, OnDestroy {
    @ViewChild('logModal', { static: false }) logModal: TemplateRef<any>;
    @ViewChild('agGrid', { static: false }) agGrid: AgGridAngular;
    public gridOptions: GridOptions;
    showLazyLoader: boolean;
    dataSource: IDatasource;
    apiConfig: APIConfig;
    subscriptions: any;
    activeModalTab: number;
    _columns: any;
    selectedLog: any;
    paginationPageSize = 30;
    currentRecordsCountPromise: Promise<any>;
    totalRecordsCount;
    currentRecordsCount;
    loaded: number;
    total: number;

    constructor(private commonService: CommonService, private appService: AppService) {
        const self = this;
        self.subscriptions = {};
        self.apiConfig = {
            count: 30,
            page: 1,
        };
        self.apiConfig.noApp = true;
    }

    ngOnInit() {
        this.setupGrid();
    }

    setupGrid() {
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
            floatingFilterComponentFramework: AgGridSharedFloatingFilterComponent
        };
        const columnDefs = [
            {
                headerName: 'Time',
                field: '_metadata.createdAt',
                valueFormatter: this.dateFormatter.bind(this),
                minWidth: 225,
                refData: {
                    filterType: 'date'
                }
            },
            {
                headerName: 'Summary',
                field: 'summary',
                valueFormatter: params => params.value,
                minWidth: 800,
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
            overlayNoRowsTemplate: '<span>No records to display</span>'
        };
        this.dataSource = {
            getRows: (params: IGetRowsParams) => {
                this.apiConfig.page = Math.ceil(params.endRow / 30);
                if (this.apiConfig.page === 1) {
                    this.loaded = 0;
                }
                if (!this.apiConfig.filter) {
                    this.apiConfig.filter = { apps: this.commonService.app._id };
                }
                const filterModel = this.agGrid?.api?.getFilterModel();
                const filterModelKeys = Object.keys(filterModel || {});
                if (!!filterModelKeys.length) {
                    this.apiConfig.filter.$and = filterModelKeys.map(key => {
                        if (typeof filterModel[key].filter === 'string') {
                            filterModel[key].filter = JSON.parse(filterModel[key].filter);
                        }
                        return filterModel[key].filter;
                    });
                } else {
                    delete this.apiConfig.filter.$and;
                }
                this.apiConfig.sort = this.appService.getSortFromModel(this.agGrid?.api?.getSortModel() || []);
                this.agGrid.api.showLoadingOverlay();
                if (this.subscriptions['getRecords_data']) {
                    this.subscriptions['getRecords_data'].unsubscribe();
                }
                this.subscriptions['getRecords_data'] = this.commonService
                    .get('log', '/mon/author/user/log' + '/count', { filter: this.apiConfig.filter, noApp: true })
                    .pipe(
                        switchMap(count => {
                            this.currentRecordsCount = count;
                            return !!count ? this.commonService.get('log', `/mon/author/user/log`, this.apiConfig) : of(null);
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
                            console.error(err);
                            params.failCallback();
                            this.commonService.errorToast(err, 'Unable to fetch logs');
                        }
                    );
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

    dateFormatter(params) {
        if (!!params?.value) {
            const date = new Date(params.value);
            return momentTz(date.toISOString()).utc().format('DD-MMM-YYYY, hh:mm:ss A, z');
        }
        return;
    }

    clearFilters() {
        this.agGrid.api.setFilterModel({});
    }
    
    get showClearFilter() {
        if (this.agGrid && this.agGrid.api) {
            const model = this.agGrid.api.getFilterModel();
            if (Object.keys(model).length > 0) {
            return true;
            }
        }
        return false;
    }
}
