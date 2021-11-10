import { Component, OnInit, Input, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColumnApi, GridApi, GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { UserDetails } from 'src/app/utils/interfaces/userDetails';
import { AgGridSharedFloatingFilterComponent } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.component';
import { GridCheckboxComponent } from 'src/app/utils/grid-checkbox/grid-checkbox.component';
import { UserListCellRendererComponent } from 'src/app/utils/user-list-cell-renderer/user-list-cell-renderer.component';
import { AgGridActionsRendererComponent } from 'src/app/utils/ag-grid-actions-renderer/ag-grid-actions-renderer.component';

@Component({
    selector: 'odp-user-group-members',
    templateUrl: './user-group-members.component.html',
    styleUrls: ['./user-group-members.component.scss']
})
export class UserGroupMembersComponent implements OnInit, OnDestroy {

    @Input() users: Array<any>;
    @ViewChild('searchUsersModal', { static: false }) searchUsersModal: TemplateRef<HTMLElement>;
    subscriptions: any;
    userList: Array<any>;
    allUsers: Array<any>;
    searchUsersModalRef: NgbModalRef;
    showLazyLoader: boolean;
    totalRecords: number;
    currentPage: number;
    pageSize: number;
    userAddgridOptions: GridOptions;
    userAddFrameworkComponents: any;
    userAddFiltering: boolean;
    userAddFilterModel: any;
    userAddGridApi: GridApi;
    userAddColumnApi: ColumnApi;
    gridOptions: GridOptions;
    frameworkComponents: any;
    filtering: boolean;
    filterModel: any;
    gridApi: GridApi;
    columnApi: ColumnApi;

    get selectedUsersList() {
        return this.userAddGridApi?.getSelectedRows() || [];
    };

    get selectedUsers() {
        return this.gridApi?.getSelectedRows() || [];
    };

    get isAllUserChecked() {
        if (!!this.gridApi) {
            const selectedNodes = this.gridApi.getSelectedNodes();
            const visibleRowCount = this.gridApi.getDisplayedRowCount();
            return !!selectedNodes.length && visibleRowCount - selectedNodes.length === 0;
        }
        return false;
    }

    get isSelectAllDisabled() {
        return !this.gridApi?.getDisplayedRowCount();
    }

    constructor(private commonService: CommonService,
        private appService: AppService) {
        const self = this;
        self.subscriptions = {};
        self.userList = [];
        self.allUsers = [];
        self.totalRecords = 0;
        self.currentPage = 1;
        self.pageSize = 30;
    }

    ngOnInit() {
        const self = this;
        if (self.users) {
            self.userList = self.users.filter(e => !e.bot);
        }
        self.totalRecords = self.userList.length;
        self.pageSize = self.userList.length;
        self.userList.forEach(user => {
            self.getUserGroups(user);
        });
        this.setupMainGrid();
        this.setupUserAddGrid();
    }

    ngOnDestroy() {
        const self = this;
        if (self.searchUsersModalRef) {
            self.searchUsersModalRef.close();
        }
    }

    setupMainGrid() {
        this.frameworkComponents = {
            customCheckboxCellRenderer: GridCheckboxComponent,
            customCellRenderer: UserListCellRendererComponent,
            actionCellRenderer: AgGridActionsRendererComponent
        };
        this.gridOptions = {
            defaultColDef: {
                cellRenderer: 'customCellRenderer',
                headerClass: 'hide-filter-icon',
                resizable: true,
                sortable: true,
                filter: 'agTextColumnFilter',
                suppressMenu: true,
                floatingFilter: true,
                floatingFilterComponentFramework: AgGridSharedFloatingFilterComponent,
                filterParams: {
                    caseSensitive: true,
                    suppressAndOrCondition: true,
                    suppressFilterButton: true
                }
            },
            columnDefs: [
                ...(this.hasPermission('PMGMUD')
                    ? [
                        {
                            headerName: '',
                            pinned: 'left',
                            sortable: false,
                            cellRenderer: 'customCheckboxCellRenderer',
                            minWidth: 40,
                            maxWidth: 40,
                            filter: false
                        }
                    ]
                    : []),
                {
                    headerName: 'Name',
                    field: 'basicDetails.name',
                    refData: {
                        filterType: 'text'
                    }
                },
                {
                    headerName: 'Username',
                    field: 'username',
                    refData: {
                        filterType: 'text'
                    }
                },
                {
                    headerName: 'Groups',
                    field: 'groups',
                    refData: {
                        filterType: 'text'
                    }
                },
                ...(this.hasPermission('PMGMUD') ? [
                    {
                        headerName: 'Actions',
                        pinned: 'right',
                        cellRenderer: 'actionCellRenderer',
                        sortable: false,
                        filter: false,
                        minWidth: 100,
                        maxWidth: 100,
                        refData: {
                            actionsButtons: 'Remove',
                            actionCallbackFunction: 'onGridAction'
                        }
                    }
                ] : [])
            ],
            ...(this.hasPermission('PMGMUD') ? { rowSelection: 'multiple', rowDeselection: true, rowMultiSelectWithClick: true } : {}),
            context: this,
            animateRows: true,
            onGridReady: this.onGridReady.bind(this),
            onRowDataChanged: this.autoSizeAllColumns.bind(this),
            onGridSizeChanged: this.forceResizeColumns.bind(this)
        };
    }

    setupUserAddGrid() {
        this.userAddFrameworkComponents = {
            customCheckboxCellRenderer: GridCheckboxComponent,
            customCellRenderer: UserListCellRendererComponent,
        };
        this.userAddgridOptions = {
            defaultColDef: {
                cellRenderer: 'customCellRenderer',
                headerClass: 'hide-filter-icon',
                resizable: true,
                sortable: true,
                filter: 'agTextColumnFilter',
                suppressMenu: true,
                floatingFilter: true,
                floatingFilterComponentFramework: AgGridSharedFloatingFilterComponent,
                filterParams: {
                    caseSensitive: true,
                    suppressAndOrCondition: true,
                    suppressFilterButton: true
                }
            },
            columnDefs: [
                {
                    headerName: '',
                    pinned: 'left',
                    sortable: false,
                    cellRenderer: 'customCheckboxCellRenderer',
                    minWidth: 40,
                    maxWidth: 40,
                    filter: false
                },
                {
                    headerName: 'Name',
                    field: 'basicDetails.name',
                    refData: {
                        filterType: 'text'
                    }
                },
                {
                    headerName: 'Username',
                    field: 'username',
                    refData: {
                        filterType: 'text',
                    }
                },
                {
                    headerName: 'Groups',
                    field: 'groups',
                    refData: {
                        filterType: 'text'
                    }
                }
            ],
            context: this,
            animateRows: true,
            rowSelection: 'multiple',
            rowDeselection: true,
            rowMultiSelectWithClick: true,
            onGridReady: this.onUserAddGridReady.bind(this),
            onRowDataChanged: this.userAddAutoSizeAllColumns.bind(this),
            onGridSizeChanged: this.userAddForceResizeColumns.bind(this),
        };
    }

    onGridAction(buttonName: string, rowNode: RowNode) {
        switch (buttonName) {
            case 'Remove': {
                this.removeUsers(rowNode.data);
            }
                break;
        }
    }

    private onUserAddGridReady(event: GridReadyEvent) {
        this.userAddGridApi = event.api;
        this.userAddColumnApi = event.columnApi;
        this.userAddForceResizeColumns();
    }

    private userAddForceResizeColumns() {
        this.userAddGridApi?.sizeColumnsToFit();
        this.userAddAutoSizeAllColumns();
    }

    private userAddAutoSizeAllColumns() {
        if (!!this.userAddGridApi && !!this.userAddColumnApi) {
            setTimeout(() => {
                const container = document.querySelector('.user-list');
                const availableWidth = !!container ? container.clientWidth - 40 : 710;
                const allColumns = this.userAddColumnApi.getAllColumns();
                allColumns?.forEach(col => {
                    this.userAddColumnApi.autoSizeColumn(col);
                    if (col.getActualWidth() > 200 || this.userAddGridApi.getDisplayedRowCount() === 0) {
                        col.setActualWidth(200);
                    }
                });
                const occupiedWidth = allColumns.reduce((pv, cv) => pv + cv.getActualWidth(), -40);
                if (occupiedWidth < availableWidth) {
                    this.userAddGridApi.sizeColumnsToFit();
                }
            }, 2000);
        }
    }

    private onGridReady(event: GridReadyEvent) {
        this.gridApi = event.api;
        this.columnApi = event.columnApi;
        this.forceResizeColumns();
    }

    private forceResizeColumns() {
        this.gridApi?.sizeColumnsToFit();
        this.autoSizeAllColumns();
    }

    private autoSizeAllColumns() {
        if (!!this.gridApi && !!this.columnApi) {
            setTimeout(() => {
                const container = document.querySelector('.grid-container');
                const availableWidth = !!container ? container.clientWidth - 140 : 980;
                const allColumns = this.columnApi.getAllColumns();
                allColumns?.forEach(col => {
                    this.columnApi.autoSizeColumn(col);
                    if (col.getActualWidth() > 200 || this.gridApi.getDisplayedRowCount() === 0) {
                        col.setActualWidth(200);
                    }
                });
                const occupiedWidth = allColumns.reduce((pv, cv) => pv + cv.getActualWidth(), -140);
                if (occupiedWidth < availableWidth) {
                    this.gridApi.sizeColumnsToFit();
                }
            }, 2000);
        }
    }

    onUserAddFilterChanged(event) {
        this.userAddFiltering = true;
        this.userAddFilterModel = this.userAddGridApi?.getFilterModel();
        setTimeout(() => {
            this.userAddFiltering = false;
        }, 1000);
    }

    onFilterChanged(event) {
        this.filtering = true;
        this.filterModel = this.gridApi?.getFilterModel();
        setTimeout(() => {
            this.filtering = false;
        }, 1000);
    }

    viewUser(user: any) {
        const self = this;
    }

    usrGroupCount(groups) {
        const teams = groups.split(',');
        let usrGroups = '';
        if (teams.length <= 3) {
            return teams.map(e => e).join(',');
        } else {
            for (let i = 0; i < 3; i++) {
                if (i !== 2) {
                    usrGroups = usrGroups + teams[i] + ',';
                } else {
                    usrGroups = usrGroups + teams[i];
                }
            }
            return `${usrGroups} <span class="text-accent">+ ${teams.length - 3}</span>`;
        }
    }

    getUserGroups(user: any) {
        const self = this;
        const options: GetOptions = {
            filter: {
                'users': user._id,
                'name': {
                    '$ne': '#'
                }
            },
            select: 'name',
            count: -1,
            noApp: true
        };
        self.subscriptions['getUsers'] = self.commonService.get('user', `/${self.commonService.app._id}/group`, options).subscribe(res => {
            user.groups = !!res?.length ? res.map(e => e.name).join(', ') : '';
        }, err => {
            user.groups = 'ERROR';
        });
    }

    getAllUsers() {
        const self = this;
        self.userAddFilterModel = null;
        const options = {
            filter: { isSuperAdmin: { $ne: true } },
            select: 'username,basicDetails.name',
            sort: 'username',
            count: 30,
            noApp: true
        };
        self.subscriptions['getAllUsers'] = self.commonService
            .get('user', `/usr/app/${self.commonService.app._id}/`, options)
            .subscribe(res => {
                self.allUsers = res;
                self.allUsers.forEach(user => {
                    self.getUserGroups(user);
                });
            }, err => {
                self.commonService.errorToast(err, 'Unable to fetch users, please try again later');
            });
    }

    addUsers() {
        const self = this;
        self.userList = self.userList.concat(self.selectedUsersList).filter((u, i, a) => a.findIndex(x => x._id === u._id) === i);
        self.clearBrowse();
        self.rebuildUsersArray();
        self.showLazyLoader = false;
    }

    clearBrowse() {
        const self = this;
        self.allUsers = [];
        this.userAddGridApi?.deselectAll();
        self.searchUsersModalRef.close(true);
    }

    showBrowseTab() {
        const self = this;
        this.getAllUsers();
        self.searchUsersModalRef = self.commonService.modal(self.searchUsersModal, { centered: true, size: 'lg' });
        self.searchUsersModalRef.result.then(close => {
            self.clearBrowse();
        }, dismiss => {
            self.clearBrowse();
        });
    }

    checkAllUser(val) {
        this.gridApi?.forEachNode(row => {
            this.gridApi.getRowNode(row.id).selectThisNode(val);
        });
    }

    removeUsers(singleUser?: any) {
        const self = this;
        const temp = self.appService.cloneObject(!!singleUser ? [singleUser] : self.selectedUsers);
        const tempUserList = self.appService.cloneObject(self.userList);
        temp.forEach(user => {
            let index = tempUserList.findIndex(u => u._id === user._id);
            if (index > -1) {
                tempUserList.splice(index, 1);
            }
            index = self.users.findIndex(u => u._id === user._id);
            if (index > -1) {
                self.users.splice(index, 1);
            }
        });
        this.userList = [...tempUserList];
    }

    rebuildUsersArray() {
        const self = this;
        const tempArr = self.userList.map(ul => self.users.findIndex(u => u._id === ul._id))
            .filter(e => e !== -1);
        tempArr.sort().reverse();
        if (tempArr && tempArr.length > 0) {
            tempArr.forEach(e => {
                self.users.splice(e, 1);
            });
        }
        self.userList.forEach(e => {
            self.users.push(e);
        });
    }

    hasPermission(type: string) {
        const self = this;
        return self.commonService.hasPermission(type);
    }

    hasPermissionStartsWith(segment: string) {
        const self = this;
        return self.commonService.hasPermissionStartsWith(segment);
    }

    isAppAdmin(user: UserDetails) {
        const self = this;
        if (user.accessControl
            && user.accessControl.apps
            && user.accessControl.apps.length > 0
            && user.accessControl.apps.find(e => e._id === self.commonService.app._id)) {
            return true;
        }
        return false;
    }

    prevPage() {
        const self = this;
        self.currentPage -= 1;
    }

    nextPage() {
        const self = this;
        self.currentPage += 1;
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
}
