import { Component, ElementRef, OnDestroy, OnInit, ViewChild, TemplateRef, SecurityContext, EventEmitter } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { UserDetails } from 'src/app/utils/interfaces/userDetails';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { number } from 'src/app/home/custom-validators/number-validator';
import { DataGridColumn } from 'src/app/utils/data-grid/data-grid.directive';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'odp-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    animations: [
        trigger('moveDown', [
            state('void', style({
                // transformOrigin: 'top',
                // transform: 'scale(0)'
                height: '0px'
            })),
            transition('void => *', [
                animate('100ms ease-in', style({
                    // transform: 'scale(1)'
                    height: '50vh'
                }))
            ]),
            transition('* => void', [
                style({ transformOrigin: 'top' }),
                animate('100ms ease-out', style({
                    // transform: 'scale(0)'
                    height: '0px'
                }))
            ])
        ]),
        trigger('zoomIn', [
            state('void', style({
                transform: 'translate(-50%, -50%) scale(0) '
            })),
            transition('void => *', [
                animate('600ms cubic-bezier(0.86, 0, 0.07, 1)', style({
                    transform: 'translate(-50%, -50%) scale(1) '
                }))
            ]),
            transition('* => void', [
                animate('600ms cubic-bezier(0.86, 0, 0.07, 1)', style({
                    transform: 'translate(-50%, -50%) scale(0.1) '
                }))
            ])
        ])
    ]
})
export class UserListComponent implements OnInit, OnDestroy {
    @ViewChild('searchUserInput', { static: false }) searchUserInput: ElementRef;
    @ViewChild('reAuthenticateModal', { static: false }) reAuthenticateModal: TemplateRef<HTMLElement>;
    @ViewChild('applyingChangesModal', { static: false }) applyingChangesModal: TemplateRef<HTMLElement>;
    @ViewChild('createSuperAdminModal', { static: false }) createSuperAdminModal: TemplateRef<HTMLElement>;
    @ViewChild('changeAuthenticationModal', { static: false }) changeAuthenticationModal: TemplateRef<HTMLElement>;
    @ViewChild('deleteSelectedModal', { static: false }) deleteSelectedModal: TemplateRef<HTMLElement>;
    @ViewChild('newUserModal', { static: false }) newUserModal: TemplateRef<HTMLElement>;
    @ViewChild('userConfigModal', { static: false }) userConfigModal: TemplateRef<HTMLElement>;
    deleteModalRef: NgbModalRef;
    applyingChangesModalRef: NgbModalRef;
    changeAuthenticationModalRef: NgbModalRef;
    reAuthenticateModalRef: NgbModalRef;
    authenticateModal: NgbModalRef;
    deleteSelectedModalRef: NgbModalRef;
    newUserModalRef: NgbModalRef;
    createSuperAdminModalRef: NgbModalRef;
    userConfigModalRef: NgbModalRef;
    userForm: FormGroup;
    showSelectAppUsers: boolean;
    appList = [];
    userList: Array<UserDetails> = [];
    showLazyLoader: boolean;
    showSpinner: boolean;
    subscriptions: any = {};
    userConfig: GetOptions = {};
    selectedRow: number;
    selectedUser: any;
    showUserDetails: boolean;
    bulkUserUpload: boolean;
    selectedApp: string;
    userExist: boolean;
    authType: string;
    changeAuthModeTo: string;
    reAuthenticateData: any;
    reAuthenticateMessage: string;
    reAuthnticateLoader: boolean;
    errorMessage: string;
    changeModeFromLdap: boolean;
    ldapUrl: string;
    completed: any;
    superAdminForm: FormGroup;
    config: any;
    isAddUser: boolean;
    reAuthenticatePassword: string;
    tenant: boolean;
    toggleImportUsers: boolean;
    totalUserCount: number;
    openDeleteModal: EventEmitter<any>;
    alertModal: {
        statusChange?: boolean;
        title: string;
        message: string;
        _id: string;
    };
    azureToken: string;
    azureUsernameKey: string;
    changingUsernameKey: boolean;
    viewLdapCon: boolean;
    ldapConfig: any = {};
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    tableColumns: Array<DataGridColumn>;
    currUserType: string;
    searchTerm: string;
    showPassword:boolean;
    constructor(private commonService: CommonService,
        private fb: FormBuilder,
        private ngbToolTipConfig: NgbTooltipConfig,
        private appService: AppService,
        private router: Router,
        private ts: ToastrService,
        private domSanitizer: DomSanitizer) {
        const self = this;
        self.showSelectAppUsers = false;
        self.showLazyLoader = true;
        self.showUserDetails = false;
        self.selectedApp = 'All Apps';
        self.userForm = self.fb.group({
            username: [null, [Validators.required, Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)]],
            password: [null, [Validators.required, Validators.minLength(8)]],
            cpassword: [null, [Validators.required]],
            isSuperAdmin: [false, [Validators.required]],
            attributes: [{}],
            basicDetails: self.fb.group({
                name: [null, [Validators.required]],
                phone: [null, []],
                alternateEmail: [null, [Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)]],
                description: [null],
            }),
            accessControl: self.fb.group({
                accessLevel: ['Selected', [Validators.required]],
                apps: [[]],
            }),
            roles: [null]
        });
        self.superAdminForm = self.fb.group({
            user: self.fb.group({
                username: ['admin', [Validators.required]],
                password: [null, [Validators.required, Validators.minLength(8)]],
                cpassword: [null, [Validators.required]],
                basicDetails: self.fb.group({
                    name: [null, [Validators.required]],
                    phone: [null, [number, Validators.minLength(10), Validators.maxLength(10)]],
                    alternateEmail: [null, [Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)]]
                }),
                accessControl: self.fb.group({
                    accessLevel: ['All', [Validators.required]],
                    apps: [null],
                }),
                enableSessionRefresh: [true, [Validators.required]],
                isSuperAdmin: [true, [Validators.required]]
            })
        });
        self.completed = {
            pending: true
        };
        self.userExist = false;
        self.reAuthenticateData = {};
        self.completed = {};
        self.userList = [];
        self.totalUserCount = 0;
        self.bulkUserUpload = false;
        self.openDeleteModal = new EventEmitter();
        self.alertModal = {
            statusChange: false,
            title: '',
            message: '',
            _id: null
        };
        self.viewLdapCon = false;
        self.currentPage = 1;
        self.pageSize = 20;
        self.totalRecords = 0;
        self.tableColumns = [];
        self.currUserType = 'user';
        self.searchTerm = '';

    }

    ngOnInit() {
        const self = this;
        self.resetAuthModeSelection();
        self.ngbToolTipConfig.container = 'body';
        self.initConfig();
        self.loadApps();
        self.initColumns();
    }

    initColumns() {
        const self = this;
        self.tableColumns.push(
            {
                show: true,
                label: '',
                dataKey: 'checkbox',
                width: 50
            },
            {
                show: true,
                label: 'Name',
                dataKey: 'basicDetails.name',
            },
            {
                show: true,
                label: 'Username',
                dataKey: 'username',
            },
            {
                show: true,
                label: 'Apps',
                dataKey: 'apps',
            },
            {
                show: true,
                label: 'Last Login',
                dataKey: 'lastLogin',
            },
            {
                show: true,
                label: '',
                dataKey: 'btn'
            }
        );
    }

    getValue(key, obj) {
        const self = this;
        return self.appService.getValue(key, obj);
    }

    resetAuthModeSelection() {
        const self = this;
        if (!self.commonService.userDetails.auth['authType'] || self.commonService.userDetails.auth['authType'] === 'local') {
            self.changeAuthModeTo = 'local';
        }
        if (self.commonService.userDetails.auth['authType'] === 'ldap') {
            self.changeAuthModeTo = 'ldap';
        }
        if (self.commonService.userDetails.auth['authType'] === 'azure') {
            self.changeAuthModeTo = 'azure';
        }
    }

    initConfig() {
        const self = this;
        self.authType = self.commonService.userDetails.auth.authType;
        self.getConfig();
        self.loadMore({
            page: 1,
            count: 20
        });
    }

    searchUsers(searchTerm: string) {
        const self = this;
        self.searchTerm = searchTerm;
        self.loadMore({
            page: 1,
            count: 20,
            filter: {
                $or: [
                    { username: '/' + searchTerm + '/' },
                    { 'basicDetails.name': '/' + searchTerm + '/' }
                ]
            }
        });
    }

    clearSearch() {
        const self = this;
        self.loadMore({
            page: 1,
            count: 20
        });
    }

    enterToSelect(event: KeyboardEvent) {
        const self = this;
        if (self.userList.length > 0) {
            self.viewUser(self.userList[0]._id, null, 0);
        }
    }

    get invalidName() {
        const self = this;
        return self.userForm.get('basicDetails.name').dirty
            && self.userForm.get('basicDetails.name').hasError('required');
    }

    get invalidUsername() {
        const self = this;
        return self.userForm.get('username').dirty &&
            self.userForm.get('username').hasError('required');
    }

    get invalidUsernamePattern() {
        const self = this;
        return self.userForm.get('username').dirty && self.userForm.get('username').hasError('pattern');
    }

    get invalidUniqueUsername() {
        const self = this;
        return self.userExist;
    }

    get invalidPassword() {
        const self = this;
        return self.userForm.get('password').dirty && self.userForm.get('password').hasError('required');
    }

    get invalidPasswordLength() {
        const self = this;
        return self.userForm.get('password').dirty && self.userForm.get('password').hasError('minlength');
    }

    get invalidCPassword() {
        const self = this;
        return self.userForm.get('cpassword').dirty && self.userForm.get('cpassword').hasError('required');
    }

    get invalidPasswordMatch() {
        const self = this;
        return self.userForm.get('password').dirty
            && self.userForm.get('cpassword').dirty
            && self.userForm.get('password').value !== self.userForm.get('cpassword').value;
    }

    get invalidEmail() {
        const self = this;
        return self.userForm.get('basicDetails.alternateEmail').dirty
            && self.userForm.get('basicDetails.alternateEmail').hasError('pattern');
    }

    get invalidPhone() {
        const self = this;
        return self.userForm.get('basicDetails.phone').dirty
            && (self.userForm.get('basicDetails.phone').hasError('minlength')
                || self.userForm.get('basicDetails.phone').hasError('maxlength'));
    }

    get invalidUserForm() {
        const self = this;
        return self.invalidPhone
            || self.invalidEmail
            || self.invalidPasswordMatch
            || self.invalidCPassword
            || self.invalidPasswordLength
            || self.invalidPassword
            || self.invalidUniqueUsername
            || self.invalidUsernamePattern
            || self.invalidUsername
            || self.invalidName;
    }

    get isAllUserChecked() {
        const self = this;
        if (self.userList && self.userList.length > 0) {
            return self.userList.every(e => e.checked);
        } else {
            return false;
        }
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

    checkAllUser(val) {
        const self = this;
        self.userList.forEach(e => e.checked = val);
    }



    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
        if (self.newUserModalRef) {
            self.newUserModalRef.close();
        }
        if (self.applyingChangesModalRef) {
            self.applyingChangesModalRef.close();
        }
        if (self.changeAuthenticationModalRef) {
            self.changeAuthenticationModalRef.close();
        }
        if (self.reAuthenticateModalRef) {
            self.reAuthenticateModalRef.close();
        }
        if (self.authenticateModal) {
            self.authenticateModal.close();
        }
        if (self.deleteSelectedModalRef) {
            self.deleteSelectedModalRef.close();
        }
        if (self.createSuperAdminModalRef) {
            self.createSuperAdminModalRef.close();
        }
        if (self.deleteModalRef) {
            self.deleteModalRef.close();
        }
    }

    loadApps() {
        const self = this;
        self.commonService.isAuthenticated(true).then(res => {
            self.appList = res.apps;
        });
    }

    newUser() {
        const self = this;
        self.showPassword=false;
        self.newUserModalRef = self.commonService.modal(self.newUserModal, { centered: true, size: 'lg', windowClass: 'new-user-modal' });
        self.newUserModalRef.result.then(close => {
            self.userForm.reset({ isSuperAdmin: false, accessControl: { accessLevel: 'Selected', apps: [] } });
        }, dismiss => {
            self.userForm.reset({ isSuperAdmin: false, accessControl: { accessLevel: 'Selected', apps: [] } });
        });
    }

    addUser() {
        const self = this;
        self.userForm.get('basicDetails.name').markAsDirty();
        self.userForm.get('basicDetails.phone').markAsDirty();
        self.userForm.get('username').markAsDirty();
        self.userForm.get('password').markAsDirty();
        self.userForm.get('cpassword').markAsDirty();
        if (self.invalidUserForm) {
            return;
        } else {
            const userData = self.userForm.value;
            self.showSpinner = true;
            self.subscriptions['newUser'] = self.commonService.post('user', '/usr', userData)
                .subscribe((userRes) => {
                    self.showSpinner = false;
                    self.loadMore({
                        page: 1,
                        count: 20
                    });
                    self.selectedUser = userRes;
                    self.showUserDetails = true;
                    self.ts.success('User created successfully');
                    self.newUserModalRef.close();
                }, (err) => {
                    self.showSpinner = false;
                    self.commonService.errorToast(err);
                });
        }
    }

    filterUsers(app?) {
        const self = this;
        if (app) {
            self.selectedApp = app;
        } else {
            self.selectedApp = 'All Apps';
        }
        self.currentPage = 1;
        self.loadMore({
            page: 1,
            count: 20
        });
    }

    loadMore(config: any) {
        const self = this;
        if (!config.filter) {
            config.filter = {
                bot: self.currUserType === 'bot'
            };
        } else {
            config.filter = {
                $and: [
                    { bot: self.currUserType === 'bot' },
                    config.filter
                ]
            };
        }
        if (!config.count) {
            config.count = 20;
        }
        self.currentPage = config.page;
        self.pageSize = config.count;
        self.userConfig = config;
        self.userConfig.noApp = true;
        self.userList = [];
        self.getUserList();
        self.getUserCount();
    }

    get hasMoreRecords() {
        const self = this;
        return self.totalUserCount !== self.userList.length;
    }

    getUserCount() {
        const self = this;
        const options: GetOptions = {
            noApp: true
        };
        if (self.userConfig.filter) {
            options.filter = self.userConfig.filter;
        }
        let request;
        if (self.selectedApp !== 'All Apps') {
            request = self.commonService.get('user', `/usr/app/${self.selectedApp}/count`, options);
        } else if (self.selectedApp === 'All Apps') {
            request = self.commonService.get('user', `/usr/count`, options);
        }
        if (self.subscriptions['getUserCount']) {
            self.subscriptions['getUserCount'].unsubscribe();
        }
        self.subscriptions['getUserCount'] = request.subscribe(d => {
            self.showLazyLoader = false;
            self.totalUserCount = d;
            self.totalRecords = d;
        }, err => {
            self.showLazyLoader = false;
            self.commonService.errorToast(err, 'Unable to fetch users, please try again later');
        });
    }

    getUserList() {
        const self = this;
        self.showLazyLoader = true;
        let request;
        if (self.selectedApp !== 'All Apps') {
            request = self.commonService.get('user', `/usr/app/${self.selectedApp}`, self.userConfig);
        } else if (self.selectedApp === 'All Apps') {
            request = self.commonService.get('user', `/usr`, self.userConfig);
        }
        if (self.subscriptions['getUserList']) {
            self.subscriptions['getUserList'].unsubscribe();
        }
        self.subscriptions['getUserList'] = request.subscribe(d => {
            self.showLazyLoader = false;
            if (d.length > 0) {
                d.forEach(val => {
                    val.checked = false;
                    if (!val.auth) {
                        val.auth = {
                            authType: self.commonService.userDetails.auth.authType
                        };
                    }
                    self.userList.push(val);
                });
            }
        }, err => {
            self.showLazyLoader = false;
            self.commonService.errorToast(err, 'Unable to fetch users, please try again later');
        });
    }

    setFocus() {
        const self = this;
        self.searchUserInput.nativeElement.focus();
    }

    viewUser(id, flag?: boolean, index?: any) {
        const self = this;
        self.selectedRow = index;
        self.showUserDetails = true;
        if (flag) {
            self.appService.editUser = true;
        }
        self.selectedUser = self.userList.find(e => e._id === id);
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

    showuserList(e) {
        const self = this;
        if (e) {
            self.showUserDetails = false;
            self.loadMore({
                page: 1,
                count: 20
            });
        }
    }

    deleteUser(id: string) {
        const self = this;
        const user = self.userList.find(e => e._id === id);
        if ((user.isSuperAdmin && !self.commonService.userDetails.isSuperAdmin) || id === self.commonService.userDetails._id) {
            return;
        }
        self.alertModal.statusChange = false;
        self.alertModal.title = 'Delete User';
        self.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">' + user.username
            + '</span> user?';
        self.alertModal._id = id;
        self.openDeleteModal.emit(self.alertModal);
    }

    closeDeleteModal(data) {
        const self = this;
        if (data) {
            const url = '/usr/' + data._id;
            self.showSpinner = true;
            self.subscriptions['deleteUser'] = self.commonService.delete('user', url).subscribe(d => {
                self.showSpinner = false;
                self.showUserDetails = false;
                self.ts.success('User(s) deleted successfully');
                self.loadMore({
                    page: 1,
                    count: 20
                });
            }, err => {
                self.showSpinner = false;
                self.commonService.errorToast(err, 'Unable to delete, please try again later');
            });
        }
    }

    deleteSelected() {
        const self = this;
        self.deleteSelectedModalRef = self.commonService.modal(self.deleteSelectedModal);
        self.deleteSelectedModalRef.result.then(close => {
            if (close) {
                self.deleteUsers();
            } else {
                self.deleteSelectedModalRef.close(true);
            }
        }, dismiss => {

        });
    }

    deleteUsers() {
        const self = this;
        const temp = self.selectedUsers;
        const arr = [];
        self.showSpinner = true;
        temp.forEach(usr => {
            arr.push(new Promise((resolve, reject) => self.commonService.delete('user', '/usr/' + usr._id).subscribe(resolve, reject)));
        });
        Promise.all(arr).then(res => {
            self.showSpinner = false;
            self.loadMore({
                page: 1,
                count: 20,
                filter: {
                    $or: [
                        { username: '/' + self.searchTerm + '/' },
                        { 'basicDetails.name': '/' + self.searchTerm + '/' }
                    ]
                }
            });
            self.deleteSelectedModalRef.close(true);
        }, err => {
            self.showSpinner = false;
            self.loadMore({
                page: 1,
                count: 20,
                filter: {
                    $or: [
                        { username: '/' + self.searchTerm + '/' },
                        { 'basicDetails.name': '/' + self.searchTerm + '/' }
                    ]
                }
            });
            self.deleteSelectedModalRef.close(true);
        });
    }

    getAdminApps(user) {
        const self = this;
        const temp = self.appService.cloneObject(user.accessControl.apps.map(e => e._id)).splice(0, 3);
        if (user.accessControl.apps.length <= 3) {
            return temp.join(', ');
        } else {
            return self.domSanitizer
                .sanitize(SecurityContext.NONE,
                    `${temp.join(', ')} <span class="text-accent"> + ${user.accessControl.apps.length - 3}</span>`);
        }
    }

    checkForDuplicate() {
        const self = this;
        const enteredUN = self.userForm.get('username').value;
        self.commonService.get('user', '/usr/', { filter: { username: enteredUN }, noApp: true })
            .subscribe(res => {
                if (res.length > 0) {
                    self.userExist = true;
                } else {
                    self.userExist = false;
                }
            });
    }

    openSuperAdminModal() {
        const self = this;
        self.createSuperAdminModalRef = self.commonService.modal(self.createSuperAdminModal, { centered: true, size: 'lg' });
        self.createSuperAdminModalRef.result.then(close => {
            if (close) {
                self.completed.status = false;
                self.completed.pending = true;
                self.completed.message = null;
                self.applyingChangesModalRef = self.commonService
                    .modal(self.applyingChangesModal, { centered: true, beforeDismiss: () => false });
                self.applyingChangesModalRef.result.then(close2 => {
                }, dismiss => {
                });
                self.commonService.post('user', '/local', self.superAdminForm.value).subscribe(res => {
                    self.completed.status = true;
                    self.completed.pending = false;
                }, err => {
                    self.completed.status = false;
                    self.completed.pending = false;
                    self.completed.message = err.error.message;
                });
            } else {
                self.superAdminForm.reset({ user: { username: 'admin' } });
            }
        }, dismiss => {
        });
    }

    goBack() {
        const self = this;
        self.applyingChangesModalRef.close();
        self.completed.status = false;
        self.completed.pending = true;
        self.completed.message = null;
    }

    logout() {
        const self = this;
        self.applyingChangesModalRef.close();
        self.commonService.logout();
    }

    toggleReAuthenticate() {
        const self = this;
        self.reAuthenticateData.password = null;
        self.reAuthenticateModalRef = self.commonService.modal(self.reAuthenticateModal);
        self.reAuthenticateModalRef.result.then(close => { }, dismiss => { });
    }

    get username() {
        const self = this;
        return self.commonService.userDetails.username;
    }


    /**
     * Auth mode change code starts
     */

    changeAuthentication() {
        const self = this;
        self.changeAuthenticationModalRef = self.commonService.modal(self.changeAuthenticationModal);
        self.changeAuthenticationModalRef.result.then(close => {
            if (close) {
                if (self.authType === 'azure') {
                    self.config.username = self.commonService.userDetails.username;
                    self.thirdPartyLogin(self.config).then(data => {
                        if (data.status === 200) {
                            self.azureToken = data.body.adToken;
                            self.appService.azureToken = self.azureToken;
                            self.afterAuthenticate();
                        } else {
                            self.ts.error(data.body.message, null, { timeOut: 0, closeButton: true });
                        }
                    }).catch(err => { });
                } else {
                    self.authenticateModal = self.commonService.modal(self.reAuthenticateModal);
                }
                self.authenticateModal.result.then(close2 => { }, dismiss => { });
            } else {
                self.resetAuthModeSelection();
            }
        }, dismiss => {
            self.resetAuthModeSelection();
        });
    }

    thirdPartyLogin(options: any) {
        const self = this;
        const username = options.username || self.commonService.userDetails.username;
        const windowHeight = 500;
        const windowWidth = 600;
        const windowLeft = (window.innerWidth - windowWidth) / 2;
        const windowTop = (window.innerHeight - windowHeight) / 2;
        let url = `https://login.microsoftonline.com/${options.tenant}/oauth2/v2.0/authorize`;
        url += `?client_id=${options.clientId}`;
        url += `&redirect_uri=${options.redirectUri.userFetch}`;
        url += `&response_type=code`;
        url += `&response_mode=query`;
        url += `&scope=user.read`;
        if (username && username !== 'admin') {
            url += `&login_hint=${username}`;
        }
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
    }

    afterAuthenticate() {
        const self = this;
        if (self.isAddUser) {
            self.appService.ldapUserPass = self.reAuthenticatePassword;
            self.toggleImportUsers = true;
            self.reAuthenticatePassword = null;
            self.isAddUser = false;
        } else {
            if (self.changeAuthModeTo === 'ldap' && self.authType !== 'ldap') {
                self.router.navigate(['/auth-mode/ldap']);
            } else if (self.changeAuthModeTo === 'azure' && self.authType !== 'azure') {
                self.router.navigate(['/auth-mode/azure']);
            } else if (self.changeAuthModeTo === 'local' && self.authType !== 'local') {
                self.openSuperAdminModal();
            }
        }
    }

    addLdapUser() {
        const self = this;
        self.isAddUser = true;
        self.authenticateModal = self.commonService.modal(self.reAuthenticateModal);
        self.authenticateModal.result.then(close => {
            if (!close) {
                self.reAuthenticatePassword = null;
                self.isAddUser = false;
            }
        }, dismiss => {
            self.reAuthenticatePassword = null;
            self.isAddUser = false;
        });
    }

    addAzureUser() {
        const self = this;
        self.config.username = self.commonService.userDetails.username;
        self.thirdPartyLogin(self.config).then(data => {
            if (environment.production) {
                if (data.status === 200) {
                    self.isAddUser = true;
                    self.azureToken = data.body.adToken;
                    self.appService.azureToken = self.azureToken;
                    self.afterAuthenticate();
                } else {
                    self.isAddUser = false;
                    self.ts.error(data.body.message, null, { timeOut: 0, closeButton: true });
                }
            } else {
                self.isAddUser = true;
                self.afterAuthenticate();
            }
        }, err => {

        });
    }
    getConfig() {
        const self = this;
        self.commonService.get('user', '/config', { filter: { 'auth.mode': self.authType }, noApp: true }).subscribe(res => {
            if (res && res.length > 0) {
                self.config = res[0].auth.connectionDetails;
                if (self.authType === 'ldap') {
                    self.ldapUrl = res[0].auth.connectionDetails.url;
                    self.ldapConfig = res[0].auth;
                    self.ldapConfig.connectionDetails.mapping = JSON.parse(self.ldapConfig.connectionDetails.mapping);
                } else {
                    self.tenant = res[0].auth.connectionDetails.tenant;
                }
            }
        }, err => { });
    }
    reAuthnticate() {
        const self = this;
        self.errorMessage = null;
        self.reAuthnticateLoader = true;
        self.commonService.login({
            username: self.commonService.userDetails.username,
            password: self.reAuthenticatePassword
        }).then(res => {
            self.authenticateModal.close(true);
            self.reAuthnticateLoader = false;
            self.afterAuthenticate();
        }).catch(err => {
            self.reAuthnticateLoader = false;
            self.errorMessage = err.error.message;
        });
    }

    get selectedUsers() {
        const self = this;
        return self.userList.filter(u => u.checked) || [];
    }

    hideBulkUserUpload(event) {
        const self = this;
        self.bulkUserUpload = false;
        self.loadMore({
            page: 1,
            count: 20
        });
    }

    openUserConfigModal() {
        const self = this;
        self.azureUsernameKey = 'mail';
        self.thirdPartyLogin(self.config).then(data => {
            if (data.status === 200) {
                self.azureToken = data.body.adToken;
                self.appService.azureToken = self.azureToken;
                self.userConfigModalRef = self.commonService.modal(self.userConfigModal, { centered: true });
                self.userConfigModalRef.result.then(close => {
                    if (!close) {
                        self.azureUsernameKey = 'mail';
                    }
                    self.errorMessage = null;
                }, dismiss => {
                    self.errorMessage = null;
                    self.azureUsernameKey = 'mail';
                });
            } else {
                self.ts.error(data.body.message, null, { timeOut: 0, closeButton: true });
            }
        }).catch(err => { });
    }

    changeUsernameAttribute() {
        const self = this;
        self.changingUsernameKey = true;
        self.errorMessage = null;
        self.commonService.put('user', '/usr/changeAdAttribute', {
            adToken: self.azureToken,
            adUserAttribute: self.azureUsernameKey
        }).subscribe(res => {
            self.changingUsernameKey = false;
            self.userConfigModalRef.close(true);
        }, err => {
            self.changingUsernameKey = false;
            self.errorMessage = err.error.message;
            self.commonService.errorToast(err);
        });
    }

    fixUserEmail() {
        const self = this;
        self.changingUsernameKey = true;
        self.errorMessage = null;
        self.commonService.put('user', '/usr/fixUserEmail', {
            adToken: self.azureToken
        }).subscribe(res => {
            self.changingUsernameKey = false;
            self.userConfigModalRef.close(true);
        }, err => {
            self.changingUsernameKey = false;
            self.errorMessage = err.error.message;
            self.commonService.errorToast(err);
        });
    }

    fixUser(user: UserDetails) {
        const self = this;
        self.thirdPartyLogin(self.config).then(data => {
            if (data.status === 200) {
                self.azureToken = data.body.adToken;
                self.appService.azureToken = self.azureToken;
                self.commonService.put('user', '/usr/fixUser', {
                    adToken: self.azureToken,
                    userId: user._id
                }).subscribe(res => {
                    self.ts.success(res.message);
                }, err => {
                    self.commonService.errorToast(err);
                });
            } else {
                self.ts.error(data.body.message, null, { timeOut: 0, closeButton: true });
            }
        }).catch(err => { });
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

    toggleUsers(event) {
        const self =this;
        self.userList = [];
        self.getUserList();
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
    get adAttribute() {
        const self = this;
        return self.commonService.connectionDetails.adUsernameAttribute;
    }
    ldapConnection() {
        const self = this;
        self.viewLdapCon = !self.viewLdapCon;
        if (self.viewLdapCon) {
            self.getConfig();
        }
    }

}
