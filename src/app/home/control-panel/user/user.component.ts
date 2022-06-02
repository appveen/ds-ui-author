import { Component, OnDestroy, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular';
import { GridOptions, GridReadyEvent, IDatasource, IGetRowsParams, RowNode } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { of, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { UserDetails } from 'src/app/utils/interfaces/userDetails';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { GridCheckboxComponent } from 'src/app/utils/grid-checkbox/grid-checkbox.component';
import { UserListCellRendererComponent } from 'src/app/utils/user-list-cell-renderer/user-list-cell-renderer.component';
import { AgGridSharedFloatingFilterComponent } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.component';
import { AgGridActionsRendererComponent } from 'src/app/utils/ag-grid-actions-renderer/ag-grid-actions-renderer.component';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'odp-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {

    @ViewChild('agGrid') agGrid: AgGridAngular;
    @ViewChild('deleteModal', { static: false }) deleteModal: TemplateRef<HTMLElement>;
    @ViewChild('searchUserInput', { static: false }) searchUserInput: ElementRef;
    @ViewChild('createEditTemplate', { static: false }) createEditTemplate;
    @ViewChild('removeSelectedModal', { static: false }) removeSelectedModal: TemplateRef<HTMLElement>;
    deleteModalRef: NgbModalRef;
    searchForm: FormGroup;
    userForm: FormGroup;
    apiConfig: GetOptions = {};
    subscriptions: any = {};
    username: string;
    authType: string;
    errorMessage: string;
    isSuperAdmin: boolean;
    selectedApp: string;
    showLazyLoader: boolean;
    appList = [];
    showUsrManage: boolean;
    selectedUser: any;
    groupList: Array<any>;
    selectedGroups: Array<string>;
    breadcrumbPaths: Array<Breadcrumb>;
    bredcrumbSubject: Subject<string>;
    userInLocal: boolean;
    userInAzureAD: boolean;
    showPassword;
    frameworkComponents: any;
    gridOptions: GridOptions;
    dataSource: IDatasource;
    loadedCount: number;
    totalCount: number;
    removeSelectedModalRef: NgbModalRef;
    userToRemove: string;
    validAuthTypes: Array<any>;
    availableAuthTypes: Array<any>;
    showNewUserWindow: boolean;
    showAzureLoginButton: boolean;
    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private ngbToolTipConfig: NgbTooltipConfig,
        private ts: ToastrService,
        private appService: AppService
    ) {
        this.showUsrManage = false;
        this.selectedApp = this.commonService.app._id;
        this.apiConfig.filter = {};
        this.groupList = [];
        this.selectedGroups = [];
        this.breadcrumbPaths = [];
        this.bredcrumbSubject = new Subject<string>();
        this.showPassword = {};
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
    }

    ngOnInit() {
        this.breadcrumbPaths.push({
            active: true,
            label: 'Users'
        });
        this.configureAuthTypes();
        this.createUserForm();
        this.ngbToolTipConfig.container = 'body';
        this.username = this.commonService.userDetails.username;
        if (this.commonService.userDetails.basicDetails && this.commonService.userDetails.basicDetails.name) {
            this.username = this.commonService.userDetails.basicDetails.name;
        }
        this.isSuperAdmin = this.commonService.userDetails.isSuperAdmin;
        this.initConfig();
        this.commonService.apiCalls.componentLoading = false;
        this.searchForm = this.fb.group({
            searchTerm: ['', Validators.required]
        });
        if (this.hasPermission('PMUG')) {
            this.fetchGroups();
        }
        this.subscriptions['breadCrumbSubs'] = this.bredcrumbSubject.subscribe(usrName => {
            if (usrName) {
                this.updateBreadCrumb(usrName);
            }
        });
        this.setupGrid();
    }

    onAuthTypeChange(value) {
        console.log(value);
        this.showAzureLoginButton = false;
        if(this.userForm.get('password')){
            this.userForm.get('password').patchValue(null);
        }
        if(this.userForm.get('cpassword')){
            this.userForm.get('cpassword').patchValue(null);
        }
        if(this.userForm.get('basicDetails.name:')){
            this.userForm.get('basicDetails.name:').patchValue(null);
        }
        if(this.userForm.get('basicDetails.phone')){
            this.userForm.get('basicDetails.phone').patchValue(null);
        }
        if(this.userForm.get('basicDetails.alternateEmail')){
            this.userForm.get('basicDetails.alternateEmail').patchValue(null);
        }
        if(this.userForm.get('basicDetails.description')){
            this.userForm.get('basicDetails.description').patchValue(null);
        }
        if (value === 'azure') {
            this.showLazyLoader = true;
            this.commonService.get('user', `/${this.commonService.app._id}/user/utils/azure/token`).subscribe(res => {
                this.showLazyLoader = false;
                this.showAzureLoginButton = false;
                this.configureFormValidators();
            }, err => {
                this.showLazyLoader = false;
                this.showAzureLoginButton = true;
            });
        } else {
            this.configureFormValidators();
        }
    }

    ngOnDestroy() {
        Object.keys(this.subscriptions).forEach(e => {
            this.subscriptions[e].unsubscribe();
        });
        if (this.deleteModalRef) {
            this.deleteModalRef.close();
        }
    }

    configureAuthTypes() {
        this.authType = this.commonService.userDetails.auth.authType;
        this.validAuthTypes = !!this.appService.validAuthTypes?.length
            ? this.availableAuthTypes.filter(at => this.appService.validAuthTypes.includes(at.value))
            : [{ label: 'Local', value: 'local' }];
    }

    triggerAzureToken() {
        this.getNewAzureToken().then(() => {
            this.commonService.get('user', `/${this.commonService.app._id}/user/utils/azure/token`).subscribe(res => {
                this.showLazyLoader = false;
                this.showAzureLoginButton = false;
                this.configureFormValidators();
            }, err => {
                this.showLazyLoader = false;
                this.showAzureLoginButton = true;
            });
        }).catch(err => {
            this.commonService.errorToast(err, 'Error while trying to login to Azure AD');
        });
    }

    getNewAzureToken() {
        try {
            const url = `${environment.url.user}/${this.commonService.app._id}/user/utils/azure/token/new`
            const self = this;
            const windowHeight = 500;
            const windowWidth = 620;
            const windowLeft = ((window.outerWidth - windowWidth) / 2) + window.screenLeft;
            const windowTop = ((window.outerHeight - windowHeight) / 2) + window.screenTop;
            const windowOptions = [];
            windowOptions.push(`height=${windowHeight}`);
            windowOptions.push(`width=${windowWidth}`);
            windowOptions.push(`left=${windowLeft}`);
            windowOptions.push(`top=${windowTop}`);
            windowOptions.push(`toolbar=no`);
            windowOptions.push(`resizable=no`);
            windowOptions.push(`menubar=no`);
            windowOptions.push(`location=no`);
            const childWindow = document.open(url, '_blank', windowOptions.join(',')) as any;
            return self.appService.listenForChildClosed(childWindow);
        } catch (e) {
            throw e;
        }
    }

    createUserForm() {
        this.userForm = this.fb.group({
            userData: this.fb.group({
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
            })
        });
        this.userInLocal = false;
        this.userInAzureAD = false;
        this.userForm.get('userData.auth.authType').enable();
        this.userForm.get('userData.basicDetails.name').patchValue(null);
        if (this.hasPermission('PMUG')) {
            this.fetchGroups();
        }
        this.configureFormValidators();
    }

    configureFormValidators() {
        const value = this.userForm.get('userData.auth.authType').value;
        this.userForm.get('userData.username').clearValidators();
        this.userForm.get('userData.basicDetails.name').clearValidators();
        this.userForm.get('userData.password').clearValidators();
        this.userForm.get('userData.cpassword').clearValidators();
        if (value === 'local') {
            this.userForm.get('userData.username').setValidators([
                Validators.required,
                Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)
            ]);
            this.userForm.get('userData.basicDetails.name').setValidators([
                Validators.required,
                Validators.pattern('[a-zA-Z0-9\\s-_@#.]+')
            ]);
            if (this.commonService.userDetails.rbacPasswordComplexity) {
                this.userForm.get('userData.password').setValidators([Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*?~]).+$/)])
            }
            else {
                this.userForm.get('userData.password').setValidators([Validators.required, Validators.minLength(8)]);
            }
            this.userForm.get('userData.cpassword').setValidators([Validators.required, Validators.minLength(8)]);
        } else {
            this.userForm.get('userData.username').setValidators([Validators.required]);
            this.userForm.get('userData.basicDetails.name').setValidators([Validators.pattern('[a-zA-Z0-9\\s-_@#.]+')]);
        }
        this.userForm.get('userData.username').updateValueAndValidity();
        this.userForm.get('userData.basicDetails.name').updateValueAndValidity();
        this.userForm.get('userData.password').updateValueAndValidity();
        this.userForm.get('userData.cpassword').updateValueAndValidity();
    }

    setupGrid() {
        const isEditable = this.hasPermission('PMUBD');
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
                minWidth: 80,
                sortable: true,
                filter: 'agTextColumnFilter',
                suppressMenu: true,
                floatingFilter: true,
                floatingFilterComponentFramework: AgGridSharedFloatingFilterComponent,
                filterParams: {
                    caseSensitive: true,
                    suppressAndOrCondition: true,
                    suppressFilterButton: true,
                },
            },
            columnDefs: [
                ...(isEditable
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
                    minWidth: this.hasPermission('PMUBD') ? 130 : 94,
                    maxWidth: this.hasPermission('PMUBD') ? 130 : 94,
                    refData: {
                        actionsButtons: this.hasPermission('PMUBD') ? 'View,Remove' : 'View',
                        actionCallbackFunction: 'onGridAction'
                    }
                }
            ],
            getRowNodeId: (data) => {
                return data.username;
            },
            suppressColumnVirtualisation: true,
            context: this,
            animateRows: true,
            rowSelection: 'multiple',
            rowDeselection: true,
            rowMultiSelectWithClick: true,
            onGridReady: this.onGridReady.bind(this),
            onRowDataChanged: this.autoSizeAllColumns.bind(this),
            onGridSizeChanged: this.forceResizeColumns.bind(this),
            onRowDoubleClicked: this.onRowDoubleClick.bind(this),
            suppressCellSelection: !isEditable,
            suppressRowClickSelection: !isEditable
        };
        this.dataSource = {
            getRows: (params: IGetRowsParams) => {
                this.apiConfig.page = Math.ceil(params.endRow / 30);
                if (this.apiConfig.page === 1) {
                    this.loadedCount = 0;
                }
                if (!this.apiConfig.filter) {
                    this.apiConfig.filter = {
                        bot: false
                    };
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
                this.apiConfig.sort = sortString || 'basicDetails.name';
                this.agGrid.api.showLoadingOverlay();
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
        };
    }

    onGridAction(buttonName: string, rowNode: RowNode) {
        switch (buttonName) {
            case 'View': {
                this.onRowDoubleClick(rowNode);
            }
                break;
            case 'Remove': {
                this.removeUsers({ userIds: [rowNode.data._id], single: true });
            }
                break;
        }
    }

    private onGridReady(event: GridReadyEvent) {
        this.forceResizeColumns();
    }

    private forceResizeColumns() {
        this.agGrid.api.sizeColumnsToFit();
        this.autoSizeAllColumns();
    }

    private autoSizeAllColumns() {
        const pinnedContentSize = this.hasPermission('PMUBD') ? 170 : 94;
        if (!!this.agGrid.api && !!this.agGrid.columnApi) {
            setTimeout(() => {
                const container = document.querySelector('.grid-container');
                const availableWidth = !!container ? container.clientWidth - pinnedContentSize : 1070;
                const allColumns = this.agGrid.columnApi.getAllColumns();
                allColumns.forEach(col => {
                    this.agGrid.columnApi.autoSizeColumn(col);
                    if (col.getActualWidth() > 200 || this.agGrid.api.getDisplayedRowCount() === 0) {
                        col.setActualWidth(200);
                    }
                });
                const occupiedWidth = allColumns.reduce((pv, cv) => pv + cv.getActualWidth(), -pinnedContentSize);
                if (occupiedWidth < availableWidth) {
                    this.agGrid.api.sizeColumnsToFit();
                }
            }, 2000);
        }
    }

    private onRowDoubleClick(row: any) {
        this.editUser(row);
    }

    checkAllUser(val) {
        this.agGrid.api.forEachNode(row => {
            this.agGrid.api.getRowNode(row.id).selectThisNode(val);
        });
    }

    initConfig() {
        this.appList = this.commonService.appList;
        this.apiConfig.count = 30;
        this.apiConfig.page = 1;
        this.apiConfig.noApp = true;
        this.apiConfig.filter = {
            bot: false
        };
    }

    get isSelectAllDisabled(): boolean {
        return !this.totalCount;
    }

    get selectedUsers(): Array<any> {
        return this.agGrid?.api?.getSelectedRows() || [];
    }

    get isAllUserChecked() {
        if (!!this.agGrid?.api) {
            const selectedNodes = this.agGrid.api.getSelectedNodes();
            const visibleRowCount = this.agGrid.api.getInfiniteRowCount();
            return (!!selectedNodes.length && (visibleRowCount - selectedNodes.length < 2));
        }
        return false;
    }

    get invalidName() {
        return (
            this.userForm.get('userData.basicDetails.name').dirty && this.userForm.get('userData.basicDetails.name').hasError('required')
        );
    }

    get invalidAuthType() {
        return this.userForm.get('userData.auth.authType').dirty && this.userForm.get('userData.auth.authType').hasError('required');
    }

    get invalidUsername() {
        return this.userForm.get('userData.username').dirty && this.userForm.get('userData.username').hasError('required');
    }

    get invalidUsernamePattern() {
        return this.userForm.get('userData.username').dirty && this.userForm.get('userData.username').hasError('pattern');
    }

    get invalidEmailPattern() {
        return (
            this.userForm.get('userData.basicDetails.alternateEmail').dirty &&
            this.userForm.get('userData.basicDetails.alternateEmail').hasError('pattern')
        );
    }

    get invalidPassword() {
        return this.userForm.get('userData.password').dirty && this.userForm.get('userData.password').hasError('required');
    }

    get invalidPasswordLength() {
        return this.userForm.get('userData.password').dirty && this.userForm.get('userData.password').hasError('minlength');
    }

    get invalidPasswordPattern() {
        if (this.commonService.userDetails.rbacPasswordComplexity) {
            return this.userForm.get('userData.password').dirty && this.userForm.get('userData.password').hasError('pattern');
        }
        else {
            return false;
        }
    }

    get invalidCPassword() {
        return this.userForm.get('userData.cpassword').dirty && this.userForm.get('userData.cpassword').hasError('required');
    }
    get invalidPasswordMatch() {
        return (
            this.userForm.get('userData.cpassword').dirty &&
            this.userForm.get('userData.password').dirty &&
            this.userForm.get('userData.cpassword').value !== this.userForm.get('userData.password').value
        );
    }

    newUser() {
        this.showPassword = {};
        if (this.validAuthTypes?.length === 1) {
            this.userForm.get('userData.auth.authType').disable();
        }
        this.showNewUserWindow = true;
        this.createUserForm();
    }

    closeWindow(reset?: boolean) {
        if (reset) {
            this.userInLocal = false;
            this.userInAzureAD = false;
            this.userForm.reset();
            this.userForm.get('userData.auth.authType').enable();
        }
        this.showNewUserWindow = false;
    }

    addUser() {
        this.userForm.get('userData.auth.authType').enable();
        this.userForm.get('userData.basicDetails.name').markAsDirty();
        this.userForm.get('userData.username').markAsDirty();
        this.userForm.get('userData.password').markAsDirty();
        this.userForm.get('userData.cpassword').markAsDirty();
        if (this.userForm.invalid) {
            return;
        } else if (this.userForm.get('userData.password').value !== this.userForm.get('userData.cpassword').value) {
            this.ts.error('Passwords mismatch');
            return;
        } else {
            this.createAndAddToGroup();
        }
    }

    importUser() {
        this.userForm.get('userData.auth.authType').enable();
        const payload = {
            groups: this.selectedGroups
        };
        const username = this.userForm.get('userData.username').value;
        this.showLazyLoader = true;
        this.commonService.put('user', `/${this.commonService.app._id}/user/utils/import/${username}`, payload).subscribe(
            res => {
                this.showLazyLoader = false;
                this.closeWindow(true);
                this.initConfig();
                this.agGrid.api?.purgeInfiniteCache();
                this.ts.success('User Imported successfully');
                this.userInLocal = false;
                this.userInAzureAD = false;
            },
            err => {
                this.showLazyLoader = false;
                this.commonService.errorToast(err);
                this.userInLocal = false;
                this.userInAzureAD = false;
            }
        );
    }

    importUserFromAzure() {
        this.userForm.get('userData.auth.authType').enable();
        const username = this.userForm.get('userData.username').value;
        const payload = {
            users: [username],
            groups: this.selectedGroups
        };
        this.showLazyLoader = true;
        this.commonService.put('user', `/${this.commonService.app._id}/user/utils/azure/import`, payload).subscribe(
            res => {
                this.showLazyLoader = false;
                this.closeWindow(true);
                this.initConfig();
                this.agGrid.api?.purgeInfiniteCache();
                this.ts.success('User Imported successfully');
                this.userInLocal = false;
                this.userInAzureAD = false;
            },
            err => {
                this.showLazyLoader = false;
                this.commonService.errorToast(err);
                this.userInLocal = false;
                this.userInAzureAD = false;
            }
        );
    }

    createAndAddToGroup() {
        const userData = this.userForm.get('userData').value;
        const payload = {
            user: userData,
            groups: this.selectedGroups
        };
        this.showLazyLoader = true;
        this.commonService.post('user', `/${this.commonService.app._id}/user`, payload).subscribe(
            res => {
                this.showLazyLoader = false;
                this.closeWindow(true);
                this.initConfig();
                this.agGrid.api?.purgeInfiniteCache();
                this.ts.success('User created successfully');
            },
            err => {
                this.showLazyLoader = false;
                this.commonService.errorToast(err);
            }
        );
    }

    checkForDuplicate() {
        const enteredUN = this.userForm.get('userData.username').value;
        if (!enteredUN) {
            return;
        }
        if (this.agGrid.api.getRowNode(enteredUN)) {
            this.ts.warning('User already exist in this app.');
            this.userForm.get('userData.username').patchValue(null);
            return;
        }
        this.showLazyLoader = true;
        this.commonService.get('user', `/auth/authType/${enteredUN}`).subscribe(
            res => {
                this.showLazyLoader = false;
                this.userInLocal = true;
                this.userInAzureAD = false;
                this.userForm.get('userData.auth.authType').patchValue(res.authType);
                this.userForm.get('userData.auth.authType').disable();
                setTimeout(() => {
                    this.userForm.get('userData.basicDetails.name').patchValue(res.name);
                    this.userForm.get('userData.basicDetails.name').disable();
                }, 1000);
            },
            err => {
                this.showLazyLoader = false;
                this.userInLocal = false;
                this.userInAzureAD = false;
                this.userForm.get('userData.auth.authType').enable();
                this.userForm.get('userData.basicDetails.name').patchValue(null);
                this.userForm.get('userData.basicDetails.name').enable();
                this.userForm.get('userData.basicDetails.alternateEmail').patchValue(null);
                if (this.validAuthTypes.findIndex(e => e.value === 'azure') > -1) {
                    this.checkForUserInAzure();
                }
            }
        );
    }

    checkForUserInAzure() {
        const enteredUN = this.userForm.get('userData.username').value;
        if (!enteredUN) {
            return;
        }
        this.showLazyLoader = true;
        this.commonService.put('user', `/${this.commonService.app._id}/user/utils/azure/search`, { users: [enteredUN] }).subscribe(
            res => {
                this.showLazyLoader = false;
                this.userInLocal = false;
                let userData;
                let statusCode;
                if (Array.isArray(res)) {
                    userData = res[0].body;
                    statusCode = res[0].statusCode;
                } else {
                    userData = res.body;
                    statusCode = res.statusCode;
                }
                if (statusCode != 200) {
                    this.commonService.errorToast(null, 'User not found in Azure AD');
                    this.userInAzureAD = false;
                    return;
                }
                this.userInAzureAD = true;
                this.userForm.get('userData.auth.authType').patchValue('azure');
                this.userForm.get('userData.auth.authType').disable();
                this.userForm.get('userData.basicDetails.name').patchValue(userData.name);
                this.userForm.get('userData.basicDetails.name').disable();
                if (userData.phone) {
                    this.userForm.get('userData.basicDetails.phone').patchValue(userData.phone);
                }
                if (userData.email) {
                    this.userForm.get('userData.basicDetails.alternateEmail').patchValue(userData.email);
                }
            },
            err => {
                this.showLazyLoader = false;
                this.userInLocal = false;
                this.userInAzureAD = false;
                this.userForm.get('userData.auth.authType').enable();
                this.userForm.get('userData.basicDetails.name').patchValue(null);
                this.userForm.get('userData.basicDetails.name').enable();
                this.userForm.get('userData.basicDetails.alternateEmail').patchValue(null);
                // if(this.validAuthTypes.findIndex(e=>e.value === 'ldap') > -1){
                //     this.checkForUserInLDAP();
                // }
            }
        );
    }

    // checkForUserInLDAP(){

    // }

    fetchGroups() {
        this.subscriptions['fetchGroups'] = this.commonService
            .get('user', `/${this.commonService.app._id}/group`, { noApp: true, count: -1, select: 'name' })
            .subscribe(groups => {
                this.groupList = groups;
                const index = this.groupList.findIndex(e => e.name === '#');
                if (index >= 0) {
                    this.groupList.splice(index, 1);
                }
            }, err => { });
    }

    getUserCount() {
        const options = {
            filter: this.apiConfig.filter,
            noApp: true
        };
        return this.commonService.get('user', `/${this.commonService.app._id}/user/utils/count`, options);
    }

    getUserList() {
        return this.commonService.get('user', `/${this.commonService.app._id}/user`, this.apiConfig);
    }

    hasPermission(type: string) {
        return this.commonService.hasPermission(type);
    }

    getLastActiveTime(time) {
        if (time) {
            const lastLoggedIn = new Date(time);
            return moment(lastLoggedIn).fromNow() === 'a day ago' ? '1 day ago' : moment(lastLoggedIn).fromNow();
        }
        return;
    }

    editUser(event: any, flag?: boolean) {
        if (!this.hasPermission('PVUB') && !this.commonService.hasPermissionStartsWith('PMU')) {
            return;
        }
        if (flag) {
            this.appService.editUser = true;
        }
        this.showUsrManage = true;
        this.selectedUser = event.data;
        this.updateBreadCrumb(this.selectedUser?.basicDetails?.name || '');
    }

    search(event) {
        if (!this.searchForm.value.searchTerm || this.searchForm.value.searchTerm.trim() === '') {
            this.apiConfig.filter = {
                bot: false
            };
        } else {
            this.apiConfig.filter = {
                username: '/' + this.searchForm.value.searchTerm + '/',
                'basicDetails.name': '/' + this.searchForm.value.searchTerm + '/',
                bot: false
            };
        }
        this.agGrid.api.purgeInfiniteCache();
    }

    canEdit(user: UserDetails) {
        if (user._id === this.commonService.userDetails._id || (user.isSuperAdmin && !this.commonService.userDetails.isSuperAdmin)) {
            return false;
        }
        return true;
    }

    canDelete(user: UserDetails) {
        if (user._id === this.commonService.userDetails._id || (user.isSuperAdmin && !this.commonService.userDetails.isSuperAdmin)) {
            return false;
        }
        return true;
    }

    isThisUser(user) {
        return user._id === this.commonService.userDetails._id;
    }

    updateBreadCrumb(usr) {
        if (this.breadcrumbPaths.length === 2) {
            this.breadcrumbPaths.pop();
        }
        this.breadcrumbPaths.push({
            active: true,
            label: usr
        });
    }

    removeSelectedUsers(userIds?: Array<string>) {
        if (!userIds) {
            userIds = this.selectedUsers.map(e => e._id);
        }
        if (!userIds || userIds.length === 0) {
            return;
        }
        this.subscriptions['removeUsers'] = this.commonService
            .put('user', `/${this.commonService.app._id}/user/utils/removeUsers`, { userIds })
            .subscribe(() => {
                this.agGrid.api.deselectAll();
                setTimeout(() => {
                    this.agGrid.api.purgeInfiniteCache();
                }, 500);
                this.ts.success(`Removed User(s) from ${this.selectedApp} App Successfully`);
            }, err => {
                console.log(err);
                this.agGrid.api.deselectAll();
                setTimeout(() => {
                    this.agGrid.api.purgeInfiniteCache();
                }, 500);
                this.commonService.errorToast(err, 'unable to remove selected user(s), please try after sometime');
            });
    }

    removeUsers(params?: { userIds?: Array<string>; single?: boolean }) {
        if (!!params?.single) {
            this.userToRemove = !!params.userIds?.length ? params.userIds[0] : null;
        }
        this.removeSelectedModalRef = this.commonService.modal(this.removeSelectedModal);
        this.removeSelectedModalRef.result.then(
            close => {
                this.userToRemove = null;
                if (close) {
                    this.removeSelectedUsers(params?.userIds);
                } else {
                    this.removeSelectedModalRef.close(true);
                }
            },
            dismiss => {
                this.userToRemove = null;
            }
        );
    }

    insufficientPermission() {
        this.ts.warning('You don\'t have enough permissions');
    }

    isAppAdmin(user: UserDetails) {
        return !!(
            user.accessControl.apps &&
            user.accessControl.apps.length > 0 &&
            user.accessControl.apps.find(e => e._id === this.commonService.app._id)
        );
    }

    sortModelChange(model: any) {
        this.apiConfig.sort = this.appService.getSortQuery(model);
        this.agGrid.api.purgeInfiniteCache();
    }


    toggleGroup(flag: boolean, groupId: string) {
        const index = this.selectedGroups.findIndex(e => e === groupId);
        if (flag && index == -1) {
            this.selectedGroups.push(groupId);
        }
        if (!flag && index > -1) {
            this.selectedGroups.splice(index, 1);
        }
    }

    isGroupSelected(groupId: string) {
        return this.selectedGroups.includes(groupId);
    }

    get disableImport() {
        const authType = this.userForm.get('userData.auth.authType').value;
        if (authType == 'azure' && !this.userInAzureAD && !this.userInLocal) {
            return true;
        }
        return false;
    }

    get selectedAuthType() {
        return this.userForm.get('userData.auth.authType').value;
    }
}
