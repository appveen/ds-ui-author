import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { GridOptions, IDatasource, IGetRowsParams, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-bulk-import-status',
  templateUrl: './bulk-import-status.component.html',
  styleUrls: ['./bulk-import-status.component.scss']
})
export class BulkImportStatusComponent implements OnInit {

  @ViewChild('agGrid') agGrid: AgGridAngular;
  showLazyLoader: boolean;
  breadcrumbPaths: Array<Breadcrumb>;
  gridOptions: GridOptions;
  columnDefs: any;
  dataSource: IDatasource;
  fileId: string;
  apiConfig: GetOptions;
  loadedCount: number;
  totalCount: number;
  subscriptions: any;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private route: ActivatedRoute) {
    this.breadcrumbPaths = [];
    this.apiConfig = {
      count: 30
    };
    this.loadedCount = 0;
    this.totalCount = 0;
    this.subscriptions = {};
  }

  ngOnInit(): void {
    this.breadcrumbPaths.push({
      url: `/app/${this.commonService.app._id}/cp/user`,
      active: false,
      label: 'Users'
    });
    this.breadcrumbPaths.push({
      url: `/app/${this.commonService.app._id}/cp/user/bulk-import`,
      active: false,
      label: 'Bulk Import'
    });
    this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    this.route.params.subscribe(params => {
      this.breadcrumbPaths.push({
        active: true,
        label: params.id
      });
      this.commonService.changeBreadcrumb(this.breadcrumbPaths)
      this.fileId = params.id;
      this.setupGrid();
    });

  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  getUserList() {
    return this.commonService.get('user', `/${this.commonService.app._id}/user/utils/bulkCreate/${this.fileId}/userList`, this.apiConfig)
  }

  getUserCount() {
    const options = {
      filter: this.apiConfig.filter,
      noApp: true
    };
    return this.commonService.get('user', `/${this.commonService.app._id}/user/utils/bulkCreate/${this.fileId}/count`, options)
  }

  setupGrid() {
    const isEditable = this.hasPermission('PMUBD');
    this.gridOptions = {
      overlayNoRowsTemplate: 'No records in the uploaded CSV',
      defaultColDef: {
        headerClass: 'hide-filter-icon',
        resizable: true,
        sortable: true,
        filter: 'agTextColumnFilter',
        suppressMenu: true,
        floatingFilter: true,
        filterParams: {
          caseSensitive: true,
          suppressAndOrCondition: true,
          suppressFilterButton: true
        }
      },
      // getRowClass: (params) => {
      //   if (params?.data?.status === 'Created') {
      //     return 'text-success';
      //   } else if (params?.data?.status === 'Error') {
      //     return 'text-danger';
      //   } else if (params?.data?.status === 'Ignored') {
      //     return 'text-muted';
      //   } else {
      //     return 'text-dark';
      //   }
      // }
    }
    this.columnDefs = [
      {
        headerName: "Row",
        valueGetter: "node.rowIndex + 1",
      },
      {
        headerName: 'Name',
        field: 'data.name'
      },
      {
        headerName: 'Username',
        field: 'data.username'
      },
      {
        headerName: 'Auth Type',
        field: 'data.authType'
      },
      {
        headerName: 'User Exists in Platform',
        field: 'existsInPlatform',
        valueGetter: (params) => {
          if (params?.value == true) {
            return 'Yes';
          } else {
            return 'No';
          }
        }
      },
      {
        headerName: 'User Exists in App',
        field: 'existsInApp',
        valueGetter: (params) => {
          if (params?.value == true) {
            return 'Yes';
          } else {
            return 'No';
          }
        }
      },
      {
        headerName: 'Duplicate',
        field: 'duplicate',
        valueGetter: (params) => {
          if (params?.value == true) {
            return 'Yes';
          } else {
            return 'No';
          }
        }
      },
      {
        headerName: 'Status',
        field: 'status',
        cellClass: (params) => {
          if (params?.data?.status === 'Created' || params?.data?.status === 'Success') {
            return 'text-success font-weight-bold';
          } else if (params?.data?.status === 'Error') {
            return 'text-danger font-weight-bold';
          } else if (params?.data?.status === 'Ignored') {
            return 'text-muted font-weight-bold';
          } else {
            return 'text-primary font-weight-bold blink';
          }
        }
      },
      {
        headerName: 'Message',
        field: 'message',
        minWidth: 500,
        cellClass: (params) => {
          if (params?.data?.status === 'Created' || params?.data?.status === 'Success') {
            return 'text-dark';
          } else if (params?.data?.status === 'Error') {
            return 'text-danger';
          } else if (params?.data?.status === 'Ignored') {
            return 'text-muted';
          } else {
            return 'text-dark';
          }
        }
      }
    ];
    this.dataSource = {
      getRows: (params: IGetRowsParams) => {
        this.apiConfig.page = Math.ceil(params.endRow / 30);
        if (this.apiConfig.page === 1) {
          this.loadedCount = 0;
        }
        if (!this.apiConfig.filter) {
          this.apiConfig.filter = {};
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
        const sortString = this.appService.getSortFromModel(this.agGrid?.api?.getSortModel() || []);
        this.apiConfig.sort = sortString || 'data.name';
        this.agGrid.api.hideOverlay();
        this.agGrid?.api?.showLoadingOverlay();
        if (!!this.subscriptions['data_userlist']) {
          this.subscriptions['data_userlist'].unsubscribe();
        }
        this.subscriptions['data_userlist'] = this.getUserCount()
          .pipe(
            switchMap(count => {
              this.totalCount = count;
              if (!count) {
                return of(null);
              }
              return this.getUserList();
            })
          )
          .subscribe(
            docs => {
              if (!!docs) {
                this.loadedCount += docs.length;
                this.agGrid?.api?.hideOverlay();
                if (this.loadedCount < this.totalCount) {
                  params.successCallback(docs);
                } else {
                  this.totalCount = this.loadedCount;
                  params.successCallback(docs, this.totalCount);
                }
              } else {
                this.agGrid.api.showNoRowsOverlay();
                params.successCallback([], 0);
              }
            },
            err => {
              this.agGrid?.api?.hideOverlay();
              console.error(err);
              params.failCallback();
            }
          );
      }
    };
  }
}
