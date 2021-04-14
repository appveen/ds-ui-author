import { Component, ElementRef, OnDestroy, OnInit, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { GridOptions, GridReadyEvent, IDatasource, IGetRowsParams, RowNode } from 'ag-grid-community';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { GridCheckboxComponent } from 'src/app/utils/grid-checkbox/grid-checkbox.component';
import { UserListCellRendererComponent } from 'src/app/utils/user-list-cell-renderer/user-list-cell-renderer.component';
import { AgGridSharedFloatingFilterComponent } from "src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.component";
import { AgGridActionsRendererComponent } from 'src/app/utils/ag-grid-actions-renderer/ag-grid-actions-renderer.component';

@Component({
    selector: 'odp-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
    @ViewChild('agGrid') agGrid: AgGridAngular;
    @ViewChild('searchUserInput', { static: false }) searchUserInput: ElementRef;
    @ViewChild('deleteSelectedModal', { static: false }) deleteSelectedModal: TemplateRef<HTMLElement>;
    @ViewChild('newUserModal', { static: false }) newUserModal: TemplateRef<HTMLElement>;
    deleteSelectedModalRef: NgbModalRef;
    newUserModalRef: NgbModalRef;
    userForm: FormGroup;
    appList = [];
    showLazyLoader: boolean;
    showSpinner: boolean;
    subscriptions: any = {};
    userConfig: GetOptions = {};
    selectedRow: number;
    selectedUser: any;
    showUserDetails: boolean;
    bulkUserUpload: boolean;
    authType: string;
    errorMessage: string;
    toggleImportUsers: boolean;
    openDeleteModal: EventEmitter<any>;
    alertModal: {
        statusChange?: boolean;
        title: string;
        message: string;
        _id: string;
    };
    totalCount: number;
    loadedCount: number;
    currUserType: string;
    showPassword: any;
    gridOptions: GridOptions;
    frameworkComponents: any;
    dataSource: IDatasource;
    validAuthTypes: Array<any>;
    availableAuthTypes: Array<any>;
    apiConfig: any;
    invalidUniqueUsername: boolean;
    getRowsDebounceSubject: Subject<any>;
    usersToDelete: any[];

    constructor(
        private commonService: CommonService,
        private fb: FormBuilder,
        private ngbToolTipConfig: NgbTooltipConfig,
        private appService: AppService,
        private ts: ToastrService
    ) {
        this.showLazyLoader = true;
        this.showUserDetails = false;
        this.bulkUserUpload = false;
        this.openDeleteModal = new EventEmitter();
        this.alertModal = {
            statusChange: false,
            title: '',
            message: '',
            _id: null
        };
        this.totalCount = 0;
        this.loadedCount = 0;
        this.currUserType = 'user';
        this.showPassword = {};
        this.apiConfig = {
            page: 1,
            count: 30,
            noApp: true
        };
        this.availableAuthTypes = [
            {
                label: 'Local',
                value: 'local'
            },
            {
                label: 'Azure',
                value: 'azure'
            },
            {
                label: 'LDAP',
                value: 'ldap'
            }
        ];
        this.getRowsDebounceSubject = new Subject();
    }

    ngOnInit() {
        this.ngbToolTipConfig.container = 'body';
        this.initConfig();
        this.createForm();
        this.loadApps();
        this.setupGrid();
        this.configureFormValidators();
        this.userForm.get('auth.authType').valueChanges.subscribe(value => {
            this.configureFormValidators();
        });
    }

    ngOnDestroy() {
        Object.keys(this.subscriptions).forEach(e => {
            this.subscriptions[e].unsubscribe();
        });
        if (this.newUserModalRef) {
            this.newUserModalRef.close();
        }
        if (this.deleteSelectedModalRef) {
            this.deleteSelectedModalRef.close();
        }
    }

    configureFormValidators() {
        const value = this.userForm.get('auth.authType').value;
        this.userForm.get('username').clearValidators();
        this.userForm.get('basicDetails.name').clearValidators();
        this.userForm.get('password').clearValidators();
        this.userForm.get('cpassword').clearValidators();
        if (value === 'local') {
            this.userForm.get('username').setValidators([Validators.required, Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)]);
            this.userForm.get('basicDetails.name').setValidators([Validators.required, Validators.pattern('[a-zA-Z0-9\\s-_@#.]+')]);
            this.userForm.get('password').setValidators([Validators.required, Validators.minLength(8)]);
            this.userForm.get('cpassword').setValidators([Validators.required, Validators.minLength(8)]);
        } else {
            this.userForm.get('username').setValidators([Validators.required]);
            this.userForm.get('basicDetails.name').setValidators([Validators.pattern('[a-zA-Z0-9\\s-_@#.]+')]);
        }
        this.userForm.get('username').updateValueAndValidity();
        this.userForm.get('basicDetails.name').updateValueAndValidity();
        this.userForm.get('password').updateValueAndValidity();
        this.userForm.get('cpassword').updateValueAndValidity();
    }

    createForm() {
        this.userForm = this.fb.group({
            auth: this.fb.group({
                authType: [!!this.validAuthTypes?.length ? this.validAuthTypes[0].value : 'local', [Validators.required]]
            }),
            username: [null],
            password: [null],
            cpassword: [null],
            isSuperAdmin: [false, [Validators.required]],
            attributes: [{}],
            basicDetails: this.fb.group({
                name: [null],
                phone: [null, []],
                alternateEmail: [null, [Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)]],
                description: [null]
            }),
            accessControl: this.fb.group({
                accessLevel: ['Selected', [Validators.required]],
                apps: [[]]
            }),
            roles: [null]
        });
    }

    setupGrid() {
        this.subscriptions['debounce_get_rows'] = this.getRowsDebounceSubject
            .pipe(debounceTime(600), distinctUntilChanged())
            .subscribe(params => {
                this.getRows(params);
            });
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
                        filterType: 'text'
                    }
                },
                {
                    headerName: 'Apps',
                    field: 'accessControl.apps._id',
                    refData: {
                        filterType: 'list_of_values',
                        mapperFunction: 'gridAppsMapper'
                    }
                },
                {
                    headerName: 'User Type',
                    field: 'bot',
                    refData: {
                        filterType: 'list_of_values',
                        mapperFunction: 'gridUserTypeMapper'
                    }
                },
                {
                    headerName: 'Auth Mode',
                    field: 'auth.authType',
                    refData: {
                        filterType: 'list_of_values',
                        mapperFunction: 'gridAuthTypeMapper'
                    }
                },
                {
                    headerName: 'Last Login',
                    field: 'lastLogin',
                    minWidth: 270,
                    refData: {
                        filterType: 'date-time',
                        timezone: 'Zulu'
                    }
                },
                {
                    headerName: 'Actions',
                    pinned: 'right',
                    cellRenderer: 'actionCellRenderer',
                    sortable: false,
                    filter: false,
                    minWidth: 130,
                    maxWidth: 130,
                    refData: {
                        actionsButtons: 'View,Delete',
                        actionCallbackFunction: 'onGridAction'
                    }
                }
            ],
            suppressColumnVirtualisation: true,
            context: this,
            animateRows: true,
            rowSelection: 'multiple',
            rowDeselection: true,
            rowMultiSelectWithClick: true,
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

    gridAppsMapper(data: any[]) {
        const temp = !!this.appList?.length ? this.appList.map(app => app?._id || '').filter(i => !!i) : [];
        return temp.map(value => ({ label: value, value }));
    }

    gridUserTypeMapper(data: any[]) {
        return [
            { label: 'User', value: false },
            { label: 'Bot', value: true }
        ];
    }

    gridAuthTypeMapper(data: any[]) {
        return this.validAuthTypes;
    }

    private getRows(params: IGetRowsParams) {
        this.apiConfig.page = Math.ceil(params.endRow / 30);
        if (this.apiConfig.page === 1) {
            this.loadedCount = 0;
        }
        const filterModel = this.agGrid?.api?.getFilterModel();
        if(filterModel && 'accessControl.apps._id' in filterModel) {
            this.apiConfig.apps = JSON.parse(filterModel['accessControl.apps._id'].filter)['accessControl.apps._id'].$in.join(',');
        } else {
            delete this.apiConfig.apps;
        }
        const filterModelKeys = Object.keys(filterModel || {}).filter(k => k !== 'accessControl.apps._id');
        if (!!filterModelKeys.length) {
            this.apiConfig.filter = {
                $and: filterModelKeys.map(key => {
                    if (typeof filterModel[key].filter === 'string') {
                        filterModel[key].filter = JSON.parse(filterModel[key].filter);
                    }
                    return filterModel[key].filter;
                })
            };
        } else {
            delete this.apiConfig.filter;
        }
        const sortString = this.appService.getSortFromModel(this.agGrid?.api?.getSortModel() || []);
        this.apiConfig.sort = sortString || 'basicDetails.name';
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
                        if (this.loadedCount < this.totalCount) {
                            params.successCallback(docs);
                        } else {
                            this.totalCount = this.loadedCount;
                            params.successCallback(docs, this.totalCount);
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
                }
            );
    }

    private onGridReady(event: GridReadyEvent) {
        this.forceResizeColumns();
    }

    private forceResizeColumns() {
        this.agGrid.api.sizeColumnsToFit();
        this.autoSizeAllColumns();
    }

    private autoSizeAllColumns() {
        if (!!this.agGrid.api && !!this.agGrid.columnApi) {
            setTimeout(() => {
                const container = document.querySelector('.grid-container');
                const availableWidth = !!container ? container.clientWidth - 170 : 1350;
                const allColumns = this.agGrid.columnApi.getAllColumns();
                allColumns.forEach(col => {
                    this.agGrid.columnApi.autoSizeColumn(col);
                    if (col.getActualWidth() > 200 || this.agGrid.api.getDisplayedRowCount() === 0) {
                        col.setActualWidth(200);
                    }
                });
                const occupiedWidth = allColumns.reduce((pv, cv) => pv + cv.getActualWidth(), -170);
                if (occupiedWidth < availableWidth) {
                    this.agGrid.api.sizeColumnsToFit();
                }
            }, 2000);
        }
    }

    private onRowDoubleClick(row: any) {
        this.viewUser(row, true);
    }

    onGridAction(buttonName: string, rowNode: RowNode) {
        switch(buttonName) {
            case 'View': {
                this.onRowDoubleClick(rowNode);
            }
            break;
            case 'Delete': {
                this.deleteSelected([rowNode.data]);
            }
            break;
        }
    }

    getUserCount() {
        const options: any = {
            filter: this.apiConfig.filter,
            noApp: true
        };
        if(this.apiConfig.apps) {
            options.apps = this.apiConfig.apps;
        }
        return this.commonService.get('user', `/usr/count`, options);
    }

    getUserList() {
        return this.commonService.get('user', `/usr`, this.apiConfig);
    }

    initConfig() {
        this.authType = this.commonService.userDetails.auth.authType;
        this.validAuthTypes = !!this.appService.validAuthTypes?.length
            ? this.availableAuthTypes.filter(at => this.appService.validAuthTypes.includes(at.value))
            : [{ label: 'Local', value: 'local' }];
    }

    checkForDuplicate() {
        const username = this.userForm.get('username').value;
        this.invalidUniqueUsername = false;
        if (username) {
            this.commonService.get('user', '/authType/' + username).subscribe(
                res => {
                    this.invalidUniqueUsername = true;
                },
                err => {}
            );
        }
    }

    get invalidName() {
        return this.userForm.get('basicDetails.name').dirty && this.userForm.get('basicDetails.name').hasError('required');
    }

    get invalidAuthType() {
        return this.userForm.get('auth.authType').dirty && this.userForm.get('auth.authType').hasError('required');
    }

    get invalidUsername() {
        return this.userForm.get('username').dirty && this.userForm.get('username').hasError('required');
    }

    get invalidUsernamePattern() {
        return this.userForm.get('username').dirty && this.userForm.get('username').hasError('pattern');
    }

    get invalidPassword() {
        return this.userForm.get('password').dirty && this.userForm.get('password').hasError('required');
    }

    get invalidPasswordLength() {
        return this.userForm.get('password').dirty && this.userForm.get('password').hasError('minlength');
    }

    get invalidCPassword() {
        return this.userForm.get('cpassword').dirty && this.userForm.get('cpassword').hasError('required');
    }

    get invalidPasswordMatch() {
        return (
            this.userForm.get('password').dirty &&
            this.userForm.get('cpassword').dirty &&
            this.userForm.get('password').value !== this.userForm.get('cpassword').value
        );
    }

    get invalidEmail() {
        return (
            this.userForm.get('basicDetails.alternateEmail').dirty && this.userForm.get('basicDetails.alternateEmail').hasError('pattern')
        );
    }

    get invalidPhone() {
        return (
            this.userForm.get('basicDetails.phone').dirty &&
            (this.userForm.get('basicDetails.phone').hasError('minlength') || this.userForm.get('basicDetails.phone').hasError('maxlength'))
        );
    }

    get invalidUserForm() {
        return this.userForm.invalid || this.invalidUniqueUsername || this.invalidPasswordMatch;
    }

    checkAllUser(val) {
        this.agGrid.api.forEachNode(row => {
            this.agGrid.api.getRowNode(row.id).selectThisNode(val);
        });
    }

    loadApps() {
        const config = {
            count: -1,
            select: 'name ',
            noApp: true,
            sort: '_id'
        };
        this.commonService.get('user', '/app', config).subscribe(
            res => {
                this.appList = res;
            },
            err => {
                console.log(err);
            }
        );
    }

    newUser() {
        this.showPassword = {};
        if(this.validAuthTypes?.length === 1) {
            this.userForm.get('auth.authType').disable();
        }
        this.newUserModalRef = this.commonService.modal(this.newUserModal, { centered: true, size: 'lg', windowClass: 'new-user-modal' });
        this.newUserModalRef.result.then(
            close => {
                this.userForm.reset({
                    auth: { authType: !!this.validAuthTypes?.length ? this.validAuthTypes[0].value : 'local' },
                    isSuperAdmin: false,
                    accessControl: { accessLevel: 'Selected', apps: [] }
                });
            },
            dismiss => {
                this.userForm.reset({
                    auth: { authType: !!this.validAuthTypes?.length ? this.validAuthTypes[0].value : 'local' },
                    isSuperAdmin: false,
                    accessControl: { accessLevel: 'Selected', apps: [] }
                });
            }
        );
    }

    addUser() {
        if (this.invalidUserForm) {
            return;
        } else {
            this.userForm.get('auth.authType').enable();
            const userData = this.userForm.value;
            this.showSpinner = true;
            this.subscriptions['newUser'] = this.commonService.post('user', '/usr', userData).subscribe(
                userRes => {
                    this.showSpinner = false;
                    this.agGrid.api.purgeInfiniteCache();
                    this.selectedUser = userRes;
                    this.showUserDetails = true;
                    this.ts.success('User created successfully');
                    this.newUserModalRef.close();
                },
                err => {
                    this.showSpinner = false;
                    this.commonService.errorToast(err);
                }
            );
        }
    }

    viewUser(event: any, flag?: boolean) {
        this.selectedRow = event.rowIndex;
        if (flag) {
            this.appService.editUser = true;
        }
        this.selectedUser = event.data;
        this.showUserDetails = true;
    }

    isThisUser(user) {
        return this.commonService.isThisUser(user);
    }

    getLastActiveTime(time) {
        if (time) {
            const lastLoggedIn = new Date(time);
            return moment(lastLoggedIn).fromNow() === 'a day ago' ? '1 day ago' : moment(lastLoggedIn).fromNow();
        }
        return;
    }

    deleteUser(user: any) {
        if ((user.isSuperAdmin && !this.commonService.userDetails.isSuperAdmin) || user._id === this.commonService.userDetails._id) {
            return;
        }
        this.alertModal.statusChange = false;
        this.alertModal.title = 'Delete User';
        this.alertModal.message =
            'Are you sure you want to delete <span class="text-delete font-weight-bold">' + user.username + '</span> user?';
        this.alertModal._id = user._id;
        this.openDeleteModal.emit(this.alertModal);
    }

    closeDeleteModal(data) {
        if (data) {
            const url = '/usr/' + data._id;
            this.showSpinner = true;
            this.subscriptions['deleteUser'] = this.commonService.delete('user', url).subscribe(
                d => {
                    this.showSpinner = false;
                    this.showUserDetails = false;
                    this.ts.success('User(s) deleted successfully');
                    this.agGrid.api.deselectAll();
                    this.agGrid.api.purgeInfiniteCache();
                },
                err => {
                    this.showSpinner = false;
                    this.commonService.errorToast(err, 'Unable to delete, please try again later');
                }
            );
        }
    }

    deleteSelected(users?: Array<any>) {
        if (!!users?.length) {
            this.usersToDelete = users;
        }
        this.deleteSelectedModalRef = this.commonService.modal(this.deleteSelectedModal);
        this.deleteSelectedModalRef.result.then(
            close => {
                this.usersToDelete = null;
                if (close) {
                    this.deleteUsers(users);
                } else {
                    this.deleteSelectedModalRef.close(true);
                }
            },
            dismiss => {
                this.usersToDelete = null;
            }
        );
    }

    deleteUsers(users?: Array<any>) {
        const deleteReqArr = (!!users?.length ? users : this.selectedUsers).map(
            usr => new Promise((resolve, reject) => this.commonService.delete('user', '/usr/' + usr._id).subscribe(resolve, reject))
        );
        this.showSpinner = true;
        Promise.all(deleteReqArr).then(
            res => {
                this.showSpinner = false;
                this.agGrid.api.deselectAll();
                this.agGrid.api.purgeInfiniteCache();
                this.ts.success(`${deleteReqArr.length > 1 ? 'Users' : 'User'} deleted successfully`)
                this.deleteSelectedModalRef.close(true);
            },
            err => {
                this.showSpinner = false;
                this.agGrid.api.deselectAll();
                this.agGrid.api.purgeInfiniteCache();
                this.commonService.errorToast(err, 'Unable to delete user, please try again later');
                this.deleteSelectedModalRef.close(true);
            }
        );
    }

    get username() {
        return this.commonService.userDetails.username;
    }

    get isAllUserChecked() {
        if (!!this.agGrid?.api) {
            const selectedNodes = this.agGrid.api.getSelectedNodes();
            const visibleRowCount = this.agGrid.api.getInfiniteRowCount();
            return !!selectedNodes.length && visibleRowCount - selectedNodes.length < 2;
        }
        return false;
    }

    get selectedUsers(): Array<any> {
        return this.agGrid?.api?.getSelectedRows() || [];
    }

    get isSelectAllDisabled(): boolean {
        return !this.totalCount;
    }

    hideBulkUserUpload(event) {
        this.bulkUserUpload = false;
        this.agGrid.api.purgeInfiniteCache();
    }

    backToList() {
        this.showUserDetails = false;
        this.agGrid?.api?.purgeInfiniteCache();
    }
}
