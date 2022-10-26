import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    Renderer2,
    ViewChild,
    QueryList,
    ViewChildren,
    ChangeDetectorRef,
    TemplateRef
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular';
import { GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { AppService } from 'src/app/utils/services/app.service';
import { SessionService } from 'src/app/utils/services/session.service';
import { AgGridActionsRendererComponent } from 'src/app/utils/ag-grid-actions-renderer/ag-grid-actions-renderer.component';
import { AgGridSharedFloatingFilterComponent } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.component';
import { AttributesCellRendererComponent } from '../../attributes-cell-renderer/attributes-cell-renderer.component';

@Component({
    selector: 'odp-user-manage',
    templateUrl: './user-manage.component.html',
    styleUrls: ['./user-manage.component.scss'],
    animations: [
        trigger('moveDown', [
            state(
                'void',
                style({
                    transformOrigin: 'right top',
                    transform: 'scale(0)'
                })
            ),
            transition('void => *', [
                animate(
                    '250ms ease-in',
                    style({
                        transform: 'scale(1)'
                    })
                )
            ]),
            transition('* => void', [
                style({ transformOrigin: 'right top' }),
                animate(
                    '250ms ease-out',
                    style({
                        transform: 'scale(0)'
                    })
                )
            ])
        ]),
        trigger('zoomIn', [
            state(
                'void',
                style({
                    transform: 'translate(-50%, -50%) scale(0) '
                })
            ),
            transition('void => *', [
                animate(
                    '600ms cubic-bezier(0.86, 0, 0.07, 1)',
                    style({
                        transform: 'translate(-50%, -50%) scale(1) '
                    })
                )
            ]),
            transition('* => void', [
                animate(
                    '600ms cubic-bezier(0.86, 0, 0.07, 1)',
                    style({
                        transform: 'translate(-50%, -50%) scale(0.1) '
                    })
                )
            ])
        ])
    ]
})
export class UserManageComponent implements OnInit, OnDestroy {
    @ViewChild('attributeModal', { static: false }) attributeModal: TemplateRef<HTMLElement>;
    @ViewChild('resetPasswordModel', { static: false }) resetPasswordModel: TemplateRef<HTMLElement>;
    @ViewChild('agGrid') agGrid: AgGridAngular;
    @ViewChildren('newLabel') newLabel: QueryList<any>;
    @Input() bredcrumbSub: any;
    @Output() removeUser: EventEmitter<any>;
    @Output() toggleUserMngChange: EventEmitter<boolean>;
    private _user: any;
    private _toggleUserMng: boolean;
    resetPasswordModelRef: NgbModalRef;
    attributeModalRef: NgbModalRef;
    userDetails: FormGroup;
    resetPasswordForm: FormGroup;
    subscriptions: any;
    deleteModal: DeleteModalConfig;
    userGroupConfig: GetOptions = {};
    userAppConfig: GetOptions = {};
    teamOptions: GetOptions = {};
    updateTeamOption: GetOptions = {};
    userTeams: Array<any>;
    allTeams: Array<any>;
    additionInfoHelperText = 'Show More';
    showMoreInfo: boolean;
    editDetails: boolean;
    resetPwd: boolean;
    madeAppAdmin: boolean;
    showMoreOptions: boolean;
    types: Array<any>;
    openDeleteModal: EventEmitter<any>;
    showPassword = {};
    showResetPassword: boolean;
    gridOptions: GridOptions
    frameworkComponents: any;
    filtering: boolean;
    filterModel: any;
    rowData: Array<any>;
    attributesForm: FormGroup;
    editMode = true;
    chipChecked = false;
    toggleGroups: Array<any>;

    get toggleUserMng(): boolean {
        const self = this;
        return self._toggleUserMng;
    }

    @Input() set toggleUserMng(value: boolean) {
        const self = this;
        self._toggleUserMng = value;
    }

    @Input() set user(value: any) {
        const self = this;
        if (!value.attributes) {
            value.attributes = {};
        }
        self._user = value;
        if (!!self.allTeams) {
            self.getUserTeam();
        }
    }

    get user() {
        const self = this;
        return self._user;
    }

    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private appService: AppService,
        private ts: ToastrService,
        private ngbToolTipConfig: NgbTooltipConfig,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef,
        private sessionService: SessionService
    ) {
        const self = this;
        self.subscriptions = {};
        self.showMoreInfo = false;
        self.toggleUserMngChange = new EventEmitter<boolean>();
        self.removeUser = new EventEmitter<any>();
        self.editDetails = false;
        self.resetPwd = false;
        self.madeAppAdmin = false;
        // userDetails form is for updating basic user info
        self.userDetails = self.fb.group({
            name: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9\\s-_@#.]+')]],
            phone: ['', [Validators.pattern(/^[0-9]{8,16}$/)]],
            // username: ['', [Validators.required, Validators.pattern(/([\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+|admin)/)]],
            alternateEmail: ['', [Validators.pattern(/([\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+|admin)/)]]
        });
        // resetPasswordForm form is for updating user password
        self.resetPasswordForm = self.fb.group({
            password: [null],
            cpassword: [null, [Validators.required]]
        });
        if (self.commonService.userDetails.rbacPasswordComplexity) {
            self.resetPasswordForm.get('password').setValidators([Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*?~]).+$/)])
        }
        else {
            self.resetPasswordForm.get('password').setValidators([Validators.required, Validators.minLength(8)])
        }
        self.resetPasswordForm.get('password').updateValueAndValidity();
        self.attributesForm = self.fb.group({
            key: ['', [Validators.required]],
            type: ['String', [Validators.required]],
            value: ['', [Validators.required]],
            label: ['', [Validators.required]]
        });
        self.attributesForm.get('label').valueChanges.pipe(filter(() => !this.editMode)).subscribe(val => {
            self.attributesForm.get('key').patchValue(self.appService.toCamelCase(val));
        });
        self.userGroupConfig.filter = {};
        self.teamOptions.filter = {};
        self.teamOptions.noApp = true;
        self.updateTeamOption.filter = {};
        self.openDeleteModal = new EventEmitter();
        // deleteModal initialization
        self.deleteModal = {
            title: 'Delete record(s)',
            message: 'Are you sure you want to delete self recordOa(s)?',
            falseButton: 'No',
            trueButton: 'Yes',
            showButtons: true
        };
        self.showMoreOptions = false;
        self.types = [
            { class: 'odp-abc', value: 'String', label: 'Text' },
            { class: 'odp-123', value: 'Number', label: 'Number' },
            { class: 'odp-boolean', value: 'Boolean', label: 'True/False' },
            { class: 'odp-calendar', value: 'Date', label: 'Date' }
        ];
    }

    ngOnInit() {
        const self = this;
        self.rowData = [...this.userAttributeList];
        self.showResetPassword =
            self.commonService.userDetails.isSuperAdmin || self.isThisUser(self.user);
        self.ngbToolTipConfig.container = 'body';
        self.commonService.apiCalls.componentLoading = false;
        self.getAllTeams();
        self.setupUserAttrsGrid();
        self.subscriptions['sessionExpired'] = self.commonService.sessionExpired.subscribe(() => {
            self.userDetails.markAsPristine();
            self.resetPasswordForm.markAsPristine();
        });
        self.renderer.listen('body', 'keyup', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                self.onCancel();
            }
        });
    }

    onAttributeFormTypeChange(type: any) {
        this.attributesForm.get('type').setValue(type.value);
        this.attributesForm.get('value').setValue(type.value === 'Boolean' ? false : null);
    }

    setupUserAttrsGrid() {
        const hasEditPermission = this.hasPermission('PMUBU');
        const hasDeletePermission = this.hasPermission('PMUBD');
        this.frameworkComponents = {
            customCellRenderer: AttributesCellRendererComponent,
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
                    headerName: 'Label',
                    field: 'label',
                    refData: {
                        filterType: 'text'
                    }
                },
                {
                    headerName: 'Key',
                    field: 'key',
                    refData: {
                        filterType: 'text'
                    }
                },
                {
                    headerName: 'Type',
                    field: 'type',
                    width: 140,
                    maxWidth: 140,
                    refData: {
                        filterType: 'list_of_values',
                        mapperFunction: 'gridAttrTypesMapper'
                    }
                },
                {
                    headerName: 'Value',
                    field: 'value',
                    filter: false,
                    refData: {
                        filterType: 'text'
                    }
                },
                ...(hasEditPermission || hasDeletePermission
                    ? [
                        {
                            headerName: 'Actions',
                            pinned: 'right',
                            cellRenderer: 'actionCellRenderer',
                            sortable: false,
                            filter: false,
                            minWidth: hasEditPermission && hasDeletePermission ? 130 : 94,
                            maxWidth: hasEditPermission && hasDeletePermission ? 130 : 94,
                            refData: {
                                actionsButtons: [hasEditPermission ? 'Edit' : '', hasDeletePermission ? 'Delete' : '']
                                    .filter(i => !!i)
                                    .join(','),
                                actionCallbackFunction: 'onGridAction'
                            }
                        }
                    ]
                    : [])
            ],
            context: this,
            animateRows: true,
            onGridReady: this.onGridReady.bind(this),
            onRowDataChanged: this.autoSizeAllColumns.bind(this),
            onGridSizeChanged: this.forceResizeColumns.bind(this),
            onRowDoubleClicked: this.onRowDoubleClick.bind(this)
        };
    }

    onFilterChanged(event) {
        this.filtering = true;
        this.filterModel = this.agGrid?.api?.getFilterModel();
        setTimeout(() => {
            this.filtering = false;
        }, 1000);
    }

    gridAttrTypesMapper(data: any[]) {
        return this.types.map(type => {
            const { label, value } = type;
            return { label, value };
        })
    }

    onGridAction(buttonName: string, rowNode: RowNode) {
        switch (buttonName) {
            case 'Edit': {
                this.editMode = true;
                this.openAttributeModal(rowNode.data);
            }
                break;
            case 'Delete': {
                this.deleteAdditionInfo(rowNode.data?.key);
            }
                break;
        }
    }

    private onGridReady(event: GridReadyEvent) {
        this.forceResizeColumns();
    }

    private forceResizeColumns() {
        this.agGrid?.api?.sizeColumnsToFit();
        this.autoSizeAllColumns();
    }

    private autoSizeAllColumns() {
        if (!!this.agGrid?.api && !!this.agGrid?.columnApi) {
            setTimeout(() => {
                const container = document.querySelector('.attrs-grid-container');
                const availableWidth = !!container ? container.clientWidth - 170 : 993;
                const allColumns = this.agGrid.columnApi.getAllColumns();
                allColumns?.forEach(col => {
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
        if (this.hasPermission('PMUBU')) {
            this.editMode = true;
            this.openAttributeModal(row.data);
        }
    }

    getLabelError() {
        return (
            this.attributesForm.get('label').touched &&
            this.attributesForm.get('label').hasError('required')
        );
    }

    getValError() {
        return (
            this.attributesForm.get('value').touched &&
            this.attributesForm.get('value').hasError('required')
        );
    }

    get extraInfo() {
        const self = this;
        return self.user.attributes ? Object.keys(self.user.attributes).length > 0 : false;
    }

    get extraInfoLen() {
        const self = this;
        return self.user.attributes ? Object.keys(self.user.attributes).length : 0;
    }

    get matchPwd() {
        const self = this;
        return self.resetPasswordForm.get('password').value !== self.resetPasswordForm.get('cpassword').value;
    }

    get initials() {
        const self = this;
        const name = (self.user?.basicDetails?.name || '').split(' ');
        return ((name[0].charAt(0) + (name.length > 1 ? name[name.length - 1].charAt(0) : '')) as string).toUpperCase();
    }

    get nameError() {
        const self = this;
        return (
            self.userDetails.get('name').touched && self.userDetails.get('name').dirty && self.userDetails.get('name').hasError('required')
        );
    }

    get phoneError() {
        const self = this;
        return self.userDetails.get('phone').dirty && self.userDetails.get('phone').hasError('pattern');
    }

    // get usernameError() {
    //     const self = this;
    //     return (self.userDetails.get('username').dirty && self.userDetails.get('username').hasError('pattern')) ||
    //         (self.userDetails.get('username') && self.userDetails.get('username').hasError('required'));
    // }

    get pwdError() {
        const self = this;
        return (
            (self.resetPasswordForm.get('password').dirty && self.resetPasswordForm.get('password').hasError('required')) ||
            (self.resetPasswordForm.get('password').dirty && self.resetPasswordForm.get('password').hasError('minlength')) ||
            (self.resetPasswordForm.get('password').dirty && self.resetPasswordForm.get('password').hasError('pattern'))
        );
    }

    get cPwdError() {
        const self = this;
        return (
            (self.resetPasswordForm.get('cpassword').dirty && self.resetPasswordForm.get('cpassword').hasError('required')) ||
            (self.resetPasswordForm.get('cpassword').dirty && self.matchPwd)
        );
    }
    // returns if a user is also an AppAdmin
    get isAppAdmin() {
        const self = this;
        if (self.user.accessControl.apps && self.user.accessControl.apps.length > 0) {
            return !!self.user.accessControl.apps.find(_app => _app._id === self.commonService.app._id) || self.madeAppAdmin;
        }
        return false;
    }

    get isElevatedUser() {
        const self = this;
        const logedInUser = self.sessionService.getUser(true);
        if (self.user._id === logedInUser._id) {
            return false;
        } else {
            const isSuperAdmin = logedInUser.isSuperAdmin;
            let isAppAdmin = false;
            if (logedInUser.accessControl.apps && logedInUser.accessControl.apps.length > 0) {
                const i = logedInUser.accessControl.apps.findIndex(_app => _app._id === self.commonService.app._id);
                if (i !== -1) {
                    isAppAdmin = true;
                }
            }
            return isSuperAdmin || isAppAdmin;
        }
    }

    editUserDetails() {
        const self = this;
        if (self.hasPermission('PMUBU')) {
            self.editDetails = !self.editDetails;
            self.userDetails.patchValue({ name: self.user?.basicDetails?.name || '' });
            self.userDetails.patchValue({ phone: self.user?.basicDetails?.phone || '' });
            // self.userDetails.patchValue({ username: self.user.username });
            self.userDetails.patchValue({ alternateEmail: self.user?.basicDetails?.alternateEmail || '' });
            if (self.authType !== 'local') {
                // self.userDetails.get('username').disable();
                self.userDetails.get('phone').disable();
            } else {
                // self.userDetails.get('username').enable();
                self.userDetails.get('phone').enable();
            }
        } else {
            self.inSufficientPermission();
        }
    }

    updateDetails() {
        const self = this;
        self.userDetails.get('name').markAsDirty();
        self.userDetails.get('phone').markAsDirty();
        // self.userDetails.get('username').markAsDirty();
        if (self.userDetails.invalid) {
            return;
        } else {
            self.user.basicDetails.name = self.userDetails.get('name').value;
            self.user.basicDetails.phone = self.userDetails.get('phone').value;
            // self.user.username = self.userDetails.get('username').value;
            if (self.userDetails.get('alternateEmail').value === '') {
                self.user.basicDetails.alternateEmail = null;
            } else {
                self.user.basicDetails.alternateEmail = self.userDetails.get('alternateEmail').value;
            }
            if (self.subscriptions['userDtl']) {
                self.subscriptions['userDtl'].unsubscribe();
            }
            self.subscriptions['userDtl'] = self.commonService.put('user', `/${this.commonService.app._id}/user/${self.user._id}`, self.user).subscribe(
                res => {
                    self.editDetails = false;
                    if (res.basicDetails.name) {
                        self.bredcrumbSub.next(res.basicDetails.name);
                    }
                    self.userDetails.reset();
                    self.ts.success('User details updated successfully');
                },
                e => {
                    self.editUserDetails();
                    self.ts.error(e.error.message);
                }
            );
        }
    }

    openResetPassword() {
        const self = this;
        self.resetPasswordModelRef = self.commonService.modal(self.resetPasswordModel);
        self.resetPasswordModelRef.result.then(
            close => {
                self.resetPasswordForm.reset();
            },
            dismiss => {
                self.resetPasswordForm.reset();
            }
        );
    }
    resetPassword() {
        const self = this;
        self.resetPasswordForm.get('password').markAsDirty();
        self.resetPasswordForm.get('cpassword').markAsDirty();
        if (self.resetPasswordForm.invalid) {
            return;
        } else {
            if (self.subscriptions['resetPwd']) {
                self.subscriptions['resetPwd'].unsubscribe();
            }
            self.subscriptions['resetPwd'] = self.commonService
                .put('user', `/${this.commonService.app._id}/user/utils/reset/${self.user._id}`, self.resetPasswordForm.value)
                .subscribe(
                    res => {
                        self.resetPasswordModelRef.close();
                        if (res && self.user._id === self.commonService.userDetails._id) {
                            self.ts.success('Redirecting to login screen, Please login again');
                            setTimeout(() => {
                                self.commonService.logout();
                            }, 3000);
                        } else if (res) {
                            self.ts.success('Password changed successfully');
                        }
                    },
                    err => {
                        self.commonService.errorToast(err, 'Unable to change password, please try again later');
                    }
                );
            self.resetPasswordForm.reset();
            self.resetPwd = false;
        }
    }

    hideToggleManage() {
        const self = this;
        self._toggleUserMng = false;
        self.toggleUserMngChange.emit(false);
    }

    deleteAdditionInfo(attrName) {
        const self = this;
        const alertModal: any = {};
        alertModal.title = 'Delete Attribute';
        alertModal.message =
            'Are you sure you want to delete <span class="text-delete font-weight-bold">' + attrName + '</span> Attribute?';
        alertModal.attrName = attrName;
        self.openDeleteModal.emit(alertModal);
    }

    removeAdminAccess() {
        const self = this;
        if (self.hasPermission('PMUG')) {
            const alertModal: any = {};
            alertModal.title = `Remove User ${self.user.basicDetails.name}'s Admin access`;
            alertModal.message = `Are you sure you want to remove user <span class="text-delete font-weight-bold">
            ${self.user.basicDetails.name}</span>'s Admin access for App ${self.commonService.app._id}?`;
            alertModal.removeAdmin = true;
            alertModal.btnText = 'Remove';
            self.openDeleteModal.emit(alertModal);
        } else {
            self.inSufficientPermission();
        }
    }

    /** removeFromApp method is used to Remove the user from current
     * App by virtue of Team/Group For removing, we emit a event
     * which is captured in parent component and this component gets
     * closed. And rest of the logic is handled in parent component
     * @author bijay_ps
     */
    removeFromApp() {
        const self = this;
        if (self.hasPermission('PMUBD')) {
            const alertModal: any = {};
            alertModal.title = `Remove User ${self.user.basicDetails.name}`;
            alertModal.message = `Are you sure you want to remove user <span class="text-delete font-weight-bold">
            ${self.user.basicDetails.name}</span> from App ${self.commonService.app._id}?`;
            alertModal.removeFromApp = true;
            alertModal.btnText = 'Remove';
            self.openDeleteModal.emit(alertModal);
        } else {
            self.inSufficientPermission();
        }
    }

    closeDeleteModal(data) {
        const self = this;
        if (data) {
            if (typeof data.attrName !== 'undefined') {
                delete self.user.attributes[data.attrName];
                self.commonService.put('user', `/${this.commonService.app._id}/user/${self.user._id}`, self.user).subscribe(
                    () => {
                        self.ts.success('Attribute deleted successfully');
                        self.rowData = [...this.userAttributeList];
                    },
                    err => {
                        self.ts.error(err.error.message);
                    },
                );
            }
            if (data.removeAdmin) {
                const payload = { apps: [] };
                payload.apps.push(self.commonService.app._id);
                self.subscriptions['removeAdminAccess'] = self.commonService
                    .put('user', `/${this.commonService.app._id}/user/utils/appAdmin/${self.user._id}/revoke`, payload)
                    .subscribe(
                        () => {
                            self.madeAppAdmin = false;
                            self.user.accessControl.accessLevel = 'Selected';
                            const index = self.user.accessControl.apps.findIndex(e => e._id === self.commonService.app._id);
                            self.user.accessControl.apps.splice(index, 1);
                            self.ts.success(`User ${self.user.basicDetails.name}'s has been successfully
                            revoked as App Admin for App ${self.commonService.app._id}`);
                        },
                        err => {
                            self.ts.error(err.error.message);
                        }
                    );
            }
            if (data.removeFromApp) {
                self._toggleUserMng = false;
                self.toggleUserMngChange.emit(false);
                self.removeUser.emit([self.user._id]);
            }
        }
    }

    makeAppAdmin() {
        const self = this;
        if (self.hasPermission('PMUG')) {
            const payload = { apps: [] };
            payload.apps.push(self.commonService.app._id);
            self.subscriptions['makeAdmin'] = self.commonService.put('user', `/${this.commonService.app._id}/user/utils/appAdmin/${self.user._id}/grant`, payload).subscribe(
                () => {
                    self.madeAppAdmin = true;
                    self.user.accessControl.accessLevel = 'Selected';
                    if (self.user.accessControl.apps) {
                        self.user.accessControl.apps.push({ _id: self.commonService.app._id, type: 'Management' });
                    } else {
                        self.user.accessControl.apps = [];
                        self.user.accessControl.apps.push({ _id: self.commonService.app._id, type: 'Management' });
                    }
                    self.ts.success(`User ${self.user.basicDetails.name} has been successfully granted App Admin privileges`);
                },
                err => {
                    self.ts.error(err.error.message);
                }
            );
        } else {
            self.inSufficientPermission();
        }
    }

    onCancel() {
        const self = this;
        if (self.editDetails) {
            self.editDetails = false;
            self.userDetails.reset();
        }
        if (self.resetPwd) {
            self.resetPwd = false;
            self.resetPasswordForm.reset();
        }
    }

    userInfo() {
        const self = this;
        self.showMoreInfo = !self.showMoreInfo;
        if (self.showMoreInfo) {
            self.additionInfoHelperText = 'Hide';
        } else {
            self.additionInfoHelperText = 'Show More';
        }
    }

    getAllTeams() {
        const self = this;
        self.teamOptions.filter = { app: self.commonService.app._id };
        self.teamOptions.count = -1;
        self.subscriptions['allTeams'] = self.commonService
            .get('user', `/${self.commonService.app._id}/group/`, self.teamOptions)
            .subscribe(
                _teams => {
                    const allTeams = _teams;
                    const index = allTeams.findIndex(e => e.name === '#');
                    if (index >= 0) {
                        allTeams.splice(index, 1);
                    }
                    self.allTeams = [...allTeams];
                    self.getUserTeam();
                },
                err => {
                    self.ts.error(err.error.message);
                }
            );
    }

    getUserTeam() {
        const self = this;
        if (self.manageGroup || self.viewGroup) {
            self.userGroupConfig.filter.users = self.user._id;
            self.userGroupConfig.count = -1;
            self.subscriptions['userTeams'] = self.commonService
                .get('user', `/${self.commonService.app._id}/group/`, self.userGroupConfig)
                .subscribe(_teams => {
                    const userTeams = _teams;
                    const index = userTeams.findIndex(e => e.name === '#');
                    if (index >= 0) {
                        userTeams.splice(index, 1);
                    }
                    self.userTeams = [...userTeams];
                    const otherTeams = self.allTeams.filter(team => self.userTeams.every(uTeam => uTeam._id !== team._id));
                    const teamSortFn = (a, b) => {
                        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
                    };
                    self.toggleGroups = [
                        ...[...self.userTeams].sort(teamSortFn).map(team => ({ _id: team._id, name: team.name, userCount: team.users?.length || 0, checked: true })),
                        ...otherTeams.sort(teamSortFn).map(team => ({ _id: team._id, name: team.name, userCount: team.users?.length || 0, checked: false }))
                    ];
                });
        }
    }

    onGroupToggle(group: any, selected: boolean) {
        group.loading = true;
        if (selected) {

            this.commonService.put('user', `/${this.commonService.app._id}/user/utils/addToGroups/${this.user._id}`, { groups: [group._id], app: this.commonService.app._id }).subscribe(
                () => {
                    this.ts.success('User has been added to group successfully');
                    this.getUserTeam();
                },
                err => {
                    group.loading = false;
                    this.commonService.errorToast(err);
                }
            );
        } else {
            const foundGroup = this.allTeams.find(team => team._id === group._id);
            if (!!foundGroup?.users?.length) {
                foundGroup.users = foundGroup.users.filter(u => u !== this.user._id);
            }
            this.commonService.put('user', `/${this.commonService.app._id}/user/utils/removeFromGroups/${this.user._id}`, { groups: [group._id], app: this.commonService.app._id }).subscribe(
                () => {
                    this.ts.success(`${group.name} Group has been removed for user ${this.user.basicDetails.name}`);
                    this.getUserTeam();
                },
                err => {
                    group.loading = false;
                    this.commonService.errorToast(err);
                }
            );
        }
    }

    inSufficientPermission() {
        const self = this;
        self.ts.warning("You don't have enough permissions");
    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
        // if (self.deleteModalTemplateRef) {
        //     self.deleteModalTemplateRef.close();
        // }
        if (self.attributeModalRef) {
            self.attributeModalRef.close();
        }
    }

    isThisUser(user: any) {
        const self = this;
        return self.commonService.isThisUser(user);
    }

    closeAllSessions(user: any) {
        const self = this;
        self.commonService
            .closeAllSessions(user._id)
            .then(res => {
                self.ts.success('User session closed');
            })
            .catch(err => {
                self.commonService.errorToast(err);
            });
    }

    hasPermission(type: string): boolean {
        const self = this;
        return self.commonService.hasPermission(type);
    }

    getUserAttributeType(val: any) {
        const self = this;
        if (val !== null) {
            return self.appService.toCapitalize(typeof val);
        }
        return 'String';
    }

    openAttributeModal(item?: any) {
        const resetValue = this.editMode ? this.appService.cloneObject(item) : { type: 'String' };
        this.attributesForm.reset(resetValue);
        this.attributeModalRef = this.commonService.modal(this.attributeModal);
        this.attributeModalRef.result.then(
            close => {
                if (close) {
                    if (!this.user.attributes) {
                        this.user.attributes = {};
                    }
                    const { key, ...rest } = this.attributesForm.value;
                    this.user.attributes[key] = this.appService.cloneObject(rest);
                    this.commonService.put('user', `/${this.commonService.app._id}/user/${this.user._id}`, this.user).subscribe(
                        () => {
                            this.rowData = [...this.userAttributeList];
                            this.ts.success('Custom Details Saved Successfully');
                        },
                        err => {
                            this.ts.error(err.error.message);
                        },
                    );
                } else if (this.editMode) {
                    const { key, ...rest } = item;
                    this.user.attributes[key] = rest;
                }
            },
            dismiss => {
            }
        );
    }

    get userAttributeList() {
        const self = this;
        const arr = [];
        if (self.user && self.user.attributes) {
            Object.keys(self.user.attributes).forEach(key => {
                arr.push({
                    key,
                    label: self.user.attributes[key].label,
                    value: self.user.attributes[key].value,
                    type: self.user.attributes[key].type
                });
            });
        }
        return arr;
    }

    get manageGroup() {
        const self = this;
        return self.commonService.hasPermission('PMUG');
    }

    get viewGroup() {
        const self = this;
        return self.commonService.hasPermission('PVUB');
    }

    get authType(): string {
        const self = this;
        if (self.commonService.userDetails.auth && self.commonService.userDetails.auth.authType) {
            return self.commonService.userDetails.auth.authType;
        } else {
            return 'local';
        }
    }
}
