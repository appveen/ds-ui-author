import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { IDatasource, IGetRowsParams, GridApi, GridOptions } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridFiltersComponent } from './ag-grid-filters/ag-grid-filters.component';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'odp-user-logs',
    templateUrl: './user-logs.component.html',
    styleUrls: ['./user-logs.component.scss']
})
export class UserLogsComponent implements OnInit, OnDestroy {
    @ViewChild('logModal', { static: false }) logModal: TemplateRef<any>;
    @ViewChild('agGrid', { static: false }) agGrid: AgGridAngular;
    public gridApi: GridApi;
    public gridOptions: GridOptions;
    showLazyLoader: boolean;
    dataSource: IDatasource;
    apiConfig: APIConfig;
    subscriptions: any;
    activeModalTab: number;
    _columns: any;
    selectedLog: any;
    rowData: any;
    columnDefs: Array<any>;
    paginationPageSize = 30;
    currentRecordsCountPromise: Promise<any>;
    totalRecordsCount;
    currentRecordsCount;
    loaded: number;
    total: number;
    noRowsTemplate;
    constructor(private commonService: CommonService,
        private datePipe: DatePipe) {
        const self = this;
        self.subscriptions = {};
        self.apiConfig = {
            count: 30,
            page: 1,
        };
        self.apiConfig.noApp = true;
        self.apiConfig.filter = {
            apps: self.commonService.app._id
        }
        self.noRowsTemplate ='<span>No records to display</span>';

    }

    ngOnInit() {
        const self = this;
        self.buildColumns();
        self.getRecordsCount(true);

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
            valueFormatter: self.dateFormatter.bind(this)

        },

        {
            headerName: 'SUMMARY', field: 'summary',
            filter: 'agTextColumnFilter', headerClass: 'hide-filter-icon', filterParams: {
                caseSensitive: true,
                suppressAndOrCondition: true,
                suppressFilterButton: true,
            },
            width: 200,
            suppressMenu: true,
            floatingFilterComponentFramework: AgGridFiltersComponent,
            minWidth: 800



        }],
            this.configureGridSettings();

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
            rowModelType: 'infinite',

        };
    }
    
    filterModified(value) {
        const self = this;
        const filterModel = self.agGrid.api.getFilterModel();
        const filter = [];
        if (filterModel) {
            Object.keys(filterModel).forEach(key => {
                try {
                    if (filterModel[key].filter) {
                        filter.push(JSON.parse(filterModel[key].filter));
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
        self.initRows();
       
    }


    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(key => {
            if (self.subscriptions[key]) {
                self.subscriptions[key].unsubscribe();
            }
        });

    }

    onReady(params?) {
        this.gridApi = params.api;
        this.getRecords();
    }

    getRecords(first?) {
        const self = this;

        self.dataSource = {
            getRows: (params: IGetRowsParams) => {
                const filter = this.gridApi.getFilterModel();
                self.agGrid.api.showLoadingOverlay();
                if (self.apiConfig.filter && self.apiConfig.filter.$and) {
                    self.apiConfig.filter.$and.push({ apps: self.commonService.app._id });
                }
                else {
                    self.apiConfig.filter = {
                        apps: self.commonService.app._id
                    }
                }

                self.currentRecordsCountPromise.then(count => {
                    if (params.endRow - 30 < self.currentRecordsCount) {
                        self.apiConfig.page = Math.ceil(params.endRow / 30);
                        if (self.subscriptions['getRecords_' + self.apiConfig.page]) {
                            self.subscriptions['getRecords_' + self.apiConfig.page].unsubscribe();
                        }
                        self.subscriptions['getRecords_' + self.apiConfig.page] = self.commonService.get('log', `/mon/author/user/log`, self.apiConfig)
                            .subscribe(rows => {
                                self.loaded = params.endRow;
                                if (self.loaded > self.currentRecordsCount) {
                                    self.loaded = self.currentRecordsCount;
                                }
                                self.agGrid.api.hideOverlay();
                                if (!rows.length) {
                                    self.agGrid.api.showNoRowsOverlay();
                                }
                                if (self.loaded === self.currentRecordsCount) {
                                    params.successCallback(rows, self.currentRecordsCount);
                                } else {
                                    params.successCallback(rows);
                                }
                            }, err => {
                                self.showLazyLoader = false;
                                self.commonService.errorToast(err, 'Unable to fetch logs');
                            });
                    }
                    else {
                        self.agGrid.api.hideOverlay();
                        if(!self.currentRecordsCount){
                            self.agGrid.api.showNoRowsOverlay();
                        }
                        params.successCallback([], self.currentRecordsCount);
                    }



                })

            }
        };
        this.gridApi.setDatasource(self.dataSource);
    }


    initRows(nocount?: boolean) {
        const self = this;
        if (!nocount) {
            self.getRecordsCount();
        }
        self.apiConfig.page = 1;
    }

    getRecordsCount(first?: boolean) {
        const self = this;
        const filter = self.apiConfig.filter;
        self.currentRecordsCountPromise = self.commonService.get('log', '/mon/author/user/log' + '/count', { filter: filter, noApp: true }).pipe(
            map(count => {
                if (first) {
                    self.totalRecordsCount = count;
                }
                self.currentRecordsCount = count;
                return count;
            })
        ).toPromise();
    }
    dateFormatter(params) {
        const self = this;
        const retval = this.datePipe.transform(params.value, 'yyyy-MM-dd  h:mm:ss a');
        return retval;
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
}
