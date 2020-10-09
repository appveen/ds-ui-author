import { Component, OnDestroy, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import * as moment from 'moment';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { UserDetails } from 'src/app/utils/interfaces/userDetails';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { DataGridColumn } from 'src/app/utils/data-grid/data-grid.directive';

@Component({
    selector: 'odp-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    animations: [
        trigger('moveUp', [
            state('void', style({
                transformOrigin: 'right bottom',
                transform: 'scale(0)'
            })),
            transition('void => *', [
                animate('250ms ease-in', style({
                    transform: 'scale(1)'
                }))
            ]),
            transition('* => void', [
                style({ transformOrigin: 'right bottom' }),
                animate('250ms ease-out', style({
                    transform: 'scale(0)'
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
        ]),
        trigger('slideIn', [
            state('void', style({
                top: '116px',
                right: '0'
            })),
            transition('void => *', [
                animate('400ms ease-in', keyframes([
                    style({
                        opacity: 0,
                        transform: 'translateX(80px)'
                    }),
                    style({
                        opacity: 1,
                        transform: 'translateX(0px)'
                    })
                ]))
            ]),
            transition('* => void', [
                animate('600ms ease-out', keyframes([
                    style({
                        opacity: .7,
                        transform: 'translateX(80px)'
                    }),
                    style({
                        opacity: .5,
                        transform: 'translateX(100px)'
                    }),
                    style({
                        opacity: 0
                    })
                ]))
            ])
        ])
    ]
})

export class UserComponent implements OnInit, OnDestroy {
    @ViewChild('changeAuthenticationModal', { static: false }) changeAuthenticationModal: TemplateRef<HTMLElement>;
    @ViewChild('reAuthenticateModal', { static: false }) reAuthenticateModal: TemplateRef<HTMLElement>;
    @ViewChild('createSuperAdminModal', { static: false }) createSuperAdminModal: TemplateRef<HTMLElement>;
    @ViewChild('applyingChangesModal', { static: false }) applyingChangesModal: TemplateRef<HTMLElement>;
    @ViewChild('deleteModal', { static: false }) deleteModal: TemplateRef<HTMLElement>;
    @ViewChild('searchUserInput', { static: false }) searchUserInput: ElementRef;
    @ViewChild('createEditTemplate', { static: false }) createEditTemplate;
    @ViewChild('newUserModal', { static: false }) newUserModal: TemplateRef<HTMLElement>;
    newUserModalRef: NgbModalRef;
    deleteModalRef: NgbModalRef;
    createSuperAdminModalRef: NgbModalRef;
    reAuthenticateModalRef: NgbModalRef;
    applyingChangesModalRef: NgbModalRef;
    searchForm: FormGroup;
    userForm: FormGroup;
    userList: Array<UserDetails> = [];
    userConfig: GetOptions = {};
    teamConfig: GetOptions = {};
    subscriptions: any = {};
    username: string;
    authType: string;
    reAuthenticatePassword: string;
    errorMessage: string;
    isSuperAdmin: boolean;
    reAuthnticateLoader: boolean;
    changeModeFromLdap: boolean;
    selectedApp: string;
    completed: {
        status?: boolean;
        message?: string;
        pending?: boolean;
    };
    showLazyLoader: boolean;
    showSelectAppUsers: boolean;
    showPlaceholders: boolean;
    appList = [];
    showUsrManage: boolean;
    selectedUser: any;
    selectedRow: number;
    filterUserText = '';
    teamList: Array<any>;
    displayTeamList: boolean;
    selectedTeamSize: number;
    config: any;
    toggleImportUsers: boolean;
    breadcrumbPaths: Array<Breadcrumb>;
    bredcrumbSubject: Subject<string>;
    totalRecords: number;

    userInLocal: boolean;
    userInOutside: boolean;
    canAccessOutside: boolean;
    azureToken: string;
    tableColumns: Array<DataGridColumn>;
    showTableFilter: boolean;
    currentPage: number;
    pageSize: number;
    showPassword:Boolean;
    constructor(private fb: FormBuilder,
        private commonService: CommonService,
        private ngbToolTipConfig: NgbTooltipConfig,
        private ts: ToastrService,
        private appService: AppService) {
        const self = this;
        self.completed = {
            pending: true
        };
        const pattern1 = '^[a-zA-Z0-9.!#$%&\'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?';
        const pattern2 = '(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$';
        const emailPtrn = pattern1 + pattern2;
        const emailRegex = new RegExp(emailPtrn);

        self.userForm = self.fb.group({
            userData: self.fb.group({
                username: [null, {
                    validators: [Validators.required, Validators.pattern(emailRegex)],
                }],
                password: [null, [Validators.required, Validators.minLength(8)]],
                cpassword: [null, {
                    validators: [Validators.required],
                    updateOn: 'blur'
                }],
                isSuperAdmin: [false],
                attributes: [{}],
                basicDetails: self.fb.group({
                    name: [null, {
                        validators: [Validators.required]
                    }],
                    phone: [null],
                    description: [null],
                    alternateEmail: [null, {
                        validators: [Validators.pattern(emailRegex)],
                        updateOn: 'blur'
                    }]
                }),
                accessControl: self.fb.group({
                    accessLevel: ['Selected'],
                    apps: [[]],
                }),
                roles: [null]
            })
        });
        // self.showLazyLoader = true;
        self.showSelectAppUsers = false;
        self.showPlaceholders = true;
        self.showUsrManage = false;
        self.selectedApp = self.commonService.app._id;
        self.userConfig.filter = {};
        self.teamConfig.filter = {};
        self.teamList = [];
        self.displayTeamList = false;
        self.selectedTeamSize = 0;
        self.config = {};
        self.breadcrumbPaths = [];
        self.bredcrumbSubject = new Subject<string>();
        self.tableColumns = [];
        self.currentPage = 1;
        self.pageSize = 10;
    }

    ngOnInit() {
        const self = this;
        self.breadcrumbPaths.push({
            active: true,
            label: 'Users'
        });
        self.ngbToolTipConfig.container = 'body';
        self.username = self.commonService.userDetails.username;
        if (self.commonService.userDetails.basicDetails && self.commonService.userDetails.basicDetails.name) {
            self.username = self.commonService.userDetails.basicDetails.name;
        }
        self.authType = self.commonService.userDetails.auth.authType;
        self.isSuperAdmin = self.commonService.userDetails.isSuperAdmin;
        if (self.authType !== 'local') {
            self.userForm.get('userData.basicDetails.name').disable();
        }
        self.initConfig();
        self.commonService.apiCalls.componentLoading = false;
        self.loadMore({
            page: 1
        });
        self.searchForm = self.fb.group({
            searchTerm: ['', Validators.required]
        });
        if (self.hasPermission('PMUG')) {
            self.fetchTeams();
        }
        self.subscriptions['breadCrumbSubs'] = self.bredcrumbSubject.subscribe(usrName => {
            if (usrName) {
                self.updateBreadCrumb(usrName);
            }
        });
        self.tableColumns.push({
            label: '#',
            checkbox: true,
            dataKey: '_checkbox',
            show: true
        });
        self.tableColumns.push({
            label: 'Name',
            dataKey: 'basicDetails.name',
            show: true
        });
        self.tableColumns.push({
            label: 'Username',
            dataKey: 'username',
            show: true
        });
        self.tableColumns.push({
            label: 'Phone',
            dataKey: 'basicDetails.phone',
            show: true
        });
        self.tableColumns.push({
            label: 'Last Login',
            dataKey: '_metadata.lastUpdated',
            show: true
        });
        self.tableColumns.push({
            dataKey: '_options',
            show: true
        });
        if (self.commonService.userDetails.auth.authType === 'ldap') {
            self.userForm.get('userData.username').clearValidators();
            self.userForm.get('userData.username').setValidators([Validators.required]);
        }
    }

    initConfig() {
        const self = this;
        self.appList = self.commonService.appList;
        self.userConfig.count = 10;
        self.userConfig.page = 1;
        self.userConfig.noApp = true;
        self.userConfig.filter = { bot: false };
        self.teamConfig.count = -1;
        self.teamConfig.filter.app = self.commonService.app;
        self.getConfig();
    }

    get usersMarked() {
        const self = this;
        return self.userList.find(usr => usr['checked']);
    }

    get invalidName() {
        const self = this;
        return self.userForm.get('userData.basicDetails.name').dirty
            && self.userForm.get('userData.basicDetails.name').hasError('required');
    }

    get invalidUsername() {
        const self = this;
        return self.userForm.get('userData.username').dirty &&
            self.userForm.get('userData.username').hasError('required');
    }

    get invalidUsernamePattern() {
        const self = this;
        return self.userForm.get('userData.username').dirty &&
            self.userForm.get('userData.username').hasError('pattern');
    }

    get invalidEmailPattern() {
        const self = this;
        return self.userForm.get('userData.basicDetails.alternateEmail').dirty &&
            self.userForm.get('userData.basicDetails.alternateEmail').hasError('pattern');
    }

    get invalidPassword() {
        const self = this;
        return self.userForm.get('userData.password').dirty &&
            self.userForm.get('userData.password').hasError('required');
    }

    get invalidPasswordLength() {
        const self = this;
        return self.userForm.get('userData.password').dirty &&
            self.userForm.get('userData.password').hasError('minlength');
    }

    get invalidCPassword() {
        const self = this;
        return self.userForm.get('userData.cpassword').dirty &&
            self.userForm.get('userData.cpassword').hasError('required');
    }
    get invalidPasswordMatch() {
        const self = this;
        return (self.userForm.get('userData.cpassword').dirty &&
            self.userForm.get('userData.password').dirty &&
            (self.userForm.get('userData.cpassword').value !== self.userForm.get('userData.password').value));
    }

    get invalidTeamSize() {
        const self = this;
        return self.userForm.get('teamData').dirty &&
            self.userForm.get('teamData').hasError('required');
    }

    checkTeamSize() {
        const self = this;
        self.selectedTeamSize = self.teamsArray.filter(e => e.value).length;
    }

    newUser() {
        const self = this;
        self.showPassword =false;
        self.newUserModalRef = self.commonService.modal(self.newUserModal, { centered: true, size: 'lg', windowClass: 'new-user-modal' });
        self.newUserModalRef.result.then(close => {
            self.userForm.get('userData.basicDetails.name').enable();
            self.userForm.reset();
        }, dismiss => {
            self.userForm.get('userData.basicDetails.name').enable();
            self.userForm.reset();
        });
    }

    openImportUserModal() {
        const self = this;
        if (self.authType === 'ldap' && !self.appService.ldapUserPass) {
            self.reAuthenticateModalRef = self.commonService.modal(self.reAuthenticateModal);
            self.reAuthenticateModalRef.result.then(close => {
                if (!close) {
                    self.reAuthenticatePassword = null;
                    self.appService.ldapUserPass = null;
                }
            }, dismiss => {
                self.reAuthenticatePassword = null;
            });
        } else {
            self.openNewUserModal();
        }
    }

    openNewUserModal() {
        const self = this;
        self.userInLocal = true;
        self.newUserModalRef = self.commonService.modal(self.newUserModal, { centered: true, size: 'lg', windowClass: 'new-user-modal' });
        self.newUserModalRef.result.then(close => {
            self.userInLocal = false;
            self.userForm.reset();
        }, dismiss => {
            self.userInLocal = false;
            self.userForm.reset();
        });
    }

    addUser() {
        const self = this;
        self.userForm.get('userData.basicDetails.name').markAsDirty();
        self.userForm.get('userData.username').markAsDirty();
        self.userForm.get('userData.password').markAsDirty();
        self.userForm.get('userData.cpassword').markAsDirty();
        if (self.userForm.invalid) {
            return;
        } else if (self.userForm.get('userData.password').value !== self.userForm.get('userData.cpassword').value) {
            self.ts.error("Passwords mismatch");
            return;
        } else {
            self.createAndAddToGroup();
        }
    }

    import() {
        const self = this;
        if (self.userInLocal && !self.userInOutside) {
            self.importUser();
        } else if (!self.userInLocal && self.userInOutside) {
            self.importUserFromOutside();
        }
    }

    importUser() {
        const self = this;
        const teamData = [];
        self.teamsArray.forEach((e, i) => {
            if (e.value) {
                teamData.push(self.teamList[i]._id);
            }
        });
        const payload = {
            groups: teamData
        };
        const username = self.userForm.get('userData.username').value;
        self.showLazyLoader = true;
        self.commonService.put('user', `/usr/${username}/${self.commonService.app._id}/import`, payload)
            .subscribe((res) => {
                self.showLazyLoader = false;
                self.newUserModalRef.close(true);
                self.initConfig();
                self.loadMore({
                    page: 1
                });
                self.ts.success('User Imported successfully');
                self.selectedTeamSize = 0;
            }, (err) => {
                self.showLazyLoader = false;
                self.commonService.errorToast(err);
                self.selectedTeamSize = 0;
            });
    }

    importUserFromOutside() {
        const self = this;
        const username = self.userForm.get('userData.username').value;
        const name = self.userForm.get('userData.basicDetails.name').value;
        const email = self.userForm.get('userData.basicDetails.alternateEmail').value;
        if (self.userInLocal
            || !self.userInOutside
            || !username
            || !name) {
            return;
        }
        const users = [{
            username,
            basicDetails: {
                alternateEmail: email ? email : username,
                name
            },
            auth: {
                authType: self.authType
            },
            accessControl: {
                accessLevel: 'None',
                apps: []
            },
            isSuperAdmin: false
        }];
        if (self.authType === 'ldap') {
            (users[0].auth as any).isLdap = true;
            (users[0].auth as any).dn = self.appService.ldapDN;
        }
        self.showLazyLoader = true;
        self.commonService.post('user', `/${self.authType.toLowerCase()}/import`, users).subscribe(res => {
            self.importUser();
        }, err => {
            self.showLazyLoader = false;
            self.commonService.errorToast(err);
        });
    }

    outsideUser(): Promise<any> {
        const self = this;
        const username = self.userForm.get('userData.username').value;
        const adUsernameAttribute = self.config.adUsernameAttribute || 'mail';

        return new Promise((resolve, reject) => {
            if (!username) {
                resolve([]);
                return;
            }
            const payload: any = {};
            if (self.authType === 'azure') {
                payload.filter = `${adUsernameAttribute} eq '${username}'`;
                payload.savedConfig = true;
                payload.adToken = self.azureToken;
            } else {
                payload.bindPassword = self.appService.ldapUserPass;
                payload.searchText = `${username}`;
                payload.strict = true;
            }
            self.commonService.post('user', `/${self.authType.toLowerCase()}/search`, payload).subscribe(res => {
                const temp = res.find(e => e.username.toLowerCase() === username.toLowerCase());
                if (temp) {
                    self.appService.ldapDN = temp.dn;
                    resolve([temp]);
                } else {
                    resolve([]);
                }
            }, err => {
                reject(err);
            });
        });
    }

    get teamsArray() {
        const self = this;
        return self.userForm.get('teamData') ? (self.userForm.get('teamData') as FormArray).controls : [];
    }

    createAndAddToGroup() {
        const self = this;
        const userData = self.userForm.get('userData').value;
        const teamData = [];
        if (self.teamsArray) {
            self.teamsArray.forEach((e, i) => {
                if (e.value) {
                    teamData.push(self.teamList[i]._id);
                }
            });
        }
        const payload = {
            user: userData,
            groups: teamData
        };
        self.showLazyLoader = true;
        self.commonService.post('user', `/usr/app/${self.commonService.app._id}/create`, payload)
            .subscribe((res) => {
                self.showLazyLoader = false;
                self.newUserModalRef.close(true);
                self.initConfig();
                self.loadMore({
                    page: 1
                });
                self.ts.success('User created successfully');
                self.selectedTeamSize = 0;
            }, (err) => {
                self.showLazyLoader = false;
                self.commonService.errorToast(err);
                self.selectedTeamSize = 0;
            });
    }

    checkForDuplicate() {
        const self = this;
        const enteredUN = self.userForm.get('userData.username').value;
        if (!enteredUN) {
            return;
        }
        if (self.userList && self.userList.length > 0 && self.userList.find(u => u.username === enteredUN)) {
            self.ts.warning('User already exist in this app.');
            self.userForm.get('userData.username').patchValue(null);
            return;
        }
        /*self.userInLocal = false;
        self.userInOutside = false;*/
        self.canAccessOutside = true;
        self.showLazyLoader = true;
        self.commonService.get('user', `/authType/${enteredUN}`)
            .subscribe(res => {
                self.showLazyLoader = false;
                const temp = res;
                self.userInLocal = true;
                self.userForm.get('userData.basicDetails.name').patchValue(temp.name);
                self.userForm.get('userData.basicDetails.name').disable();
            }, err => {
                self.userInLocal = false;
                self.userInOutside = false;
                if (self.authType === 'local') {
                    self.showLazyLoader = false;
                    self.userForm.get('userData.basicDetails.name').enable();
                } else {
                    if (self.authType === 'azure' && !self.azureToken) {
                        self.thirdPartyLogin(self.config).then(data => {
                            if (data.body && data.body.adToken && data.body.status === 200) {
                                self.azureToken = data.body.adToken;
                                self.outsideUser().then(res => {
                                    self.showLazyLoader = false;
                                    if (res && res.length > 0) {
                                        self.userForm.get('userData.username').patchValue(res[0].username);
                                        self.userForm.get('userData.basicDetails.name').patchValue(res[0].name);
                                        self.userForm.get('userData.basicDetails.alternateEmail').patchValue(res[0].email);
                                        self.userInOutside = true;
                                    }
                                }, err2 => {
                                    self.canAccessOutside = false;
                                    self.showLazyLoader = false;
                                });
                            } else {
                                self.canAccessOutside = false;
                                self.showLazyLoader = false;
                            }
                        }, err2 => {
                            self.canAccessOutside = false;
                            self.showLazyLoader = false;
                        });
                    } else {
                        self.outsideUser().then(res => {
                            self.showLazyLoader = false;
                            if (res && res.length > 0) {
                                self.userForm.get('userData.username').patchValue(res[0].username);
                                self.userForm.get('userData.basicDetails.name').patchValue(res[0].name);
                                self.userForm.get('userData.basicDetails.alternateEmail').patchValue(res[0].email);
                                self.userInOutside = true;
                            }
                        }, err2 => {
                            self.canAccessOutside = false;
                            self.showLazyLoader = false;
                        });
                    }
                }
                self.userForm.get('userData.basicDetails.name').patchValue(null);
                self.userForm.get('userData.basicDetails.alternateEmail').patchValue(null);
            });
    }

    /**
     * This method is used to initialize userForm. We are doing this inside this method so that
     * we can also  populate the team list for multiselect dropdown.
     */
    fetchTeams() {
        const self = this;
        self.subscriptions['teamsList'] = self.commonService.get('user', `/${self.commonService.app._id}/group`, { noApp: true, count: -1 })
            .subscribe((teams) => {
                self.teamList = teams;
                const index = self.teamList.findIndex(e => e.name === '#');
                if (index >= 0) {
                    self.teamList.splice(index, 1);
                }
                const controls = self.teamList.map(e => self.fb.control(false));
                self.userForm.addControl('teamData', self.fb.array(controls));
            }, err => {

            });
    }

    getUserList() {
        const self = this;
        // if (self.hasPermission('PMU') || self.hasPermission('PVU')) {
        if (self.subscriptions['getUserList']) {
            self.subscriptions['getUserList'].unsubscribe();
        }
        self.showLazyLoader = true;
        self.subscriptions['getUserList'] = self.commonService.get('user', `/usr/app/${self.commonService.app._id}`, self.userConfig)
            .subscribe((users) => {
                self.showLazyLoader = false;
                if (users.length > 0) {
                    users.forEach((usr) => {
                        usr.checked = false;
                        self.userList.push(usr);
                    });
                }
            }, (err) => {
                self.showLazyLoader = false;
                self.ts.error(err.error.message);
            });
        // }
    }

    searchUser(searchtext) {
        const self = this;
        self.showLazyLoader = true;
        self.userConfig.filter = {
            bot: false,
            $or: [
                { username: '/' + searchtext + '/' },
                { 'basicDetails.name': '/' + searchtext + '/' }
            ]
        };
        self.subscriptions['getUser'] = self.commonService.get('user', `/usr/app/${self.commonService.app._id}`, self.userConfig)
            .subscribe((user) => {
                if (user.length > 0) {
                    self.userList = [];
                    user.forEach((usr) => {
                        usr.checked = false;
                        self.userList.push(usr);
                    });
                } else {
                    self.ts.warning('No users found');
                    self.userList = [];
                }
                self.showLazyLoader = false;
            }, (err) => {
                self.showLazyLoader = false;
                self.ts.error(err.error.message);
            });
        self.getUserCount();
    }

    resetUserSearch() {
        const self = this;
        self.initConfig();
        self.loadMore({
            page: 1
        });
    }

    getUserCount() {
        const self = this;
        // if (self.hasPermissions('PMU') || self.hasPermission('PVU')) {
        // self.showLazyLoader = true;
        if (self.subscriptions['getUserCount']) {
            self.subscriptions['getUserCount'].unsubscribe();
        }
        const options = {
            filter: self.userConfig.filter,
            noApp: true
        };
        self.subscriptions['getUserCount'] = self.commonService.get('user', `/usr/app/${self.commonService.app._id}/count`, options)
            .subscribe((res) => {
                self.totalRecords = res;
            }, (err) => {
                self.ts.error(err.error.message);
            });
        // }
    }

    hasPermission(type: string) {
        const self = this;
        return self.commonService.hasPermission(type);
    }

    getLastActiveTime(time) {
        if (time) {
            const lastLoggedIn = new Date(time);
            return moment(lastLoggedIn).fromNow() === 'a day ago' ? '1 day ago' : moment(lastLoggedIn).fromNow();
        }
        return;
    }

    delete(id) {
        const self = this;
        const user = self.userList.find(e => e._id === id);
        if ((user.isSuperAdmin && !self.commonService.userDetails.isSuperAdmin) || id === self.commonService.userDetails._id) {
            return;
        }
        self.deleteModalRef = self.commonService.modal(self.deleteModal);
        self.deleteModalRef.result.then(close => {
            if (close) {
                self.showLazyLoader = true;
                self.commonService.delete('user', '/usr/' + id).subscribe(res => {
                    self.showLazyLoader = false;
                    self.loadMore({
                        page: 1
                    });
                }, err => {
                    self.showLazyLoader = false;
                    self.commonService.errorToast(err);
                });
            }
        }, dismiss => { });
    }

    editUser(event, id, flag?: boolean, index?: any) {
        event.stopPropagation();
        const self = this;
        if (!self.hasPermission('PVUB') && !self.commonService.hasPermissionStartsWith('PMU')) {
            return;
        }
        self.selectedRow = index;
        if (flag) {
            self.appService.editUser = true;
        }
        self.showUsrManage = true;
        self.selectedUser = self.userList.find(e => e._id === id);
        self.updateBreadCrumb(self.selectedUser.basicDetails.name);
    }

    // This method uses searchForm, but not sure what it is searching. Check if we need this method
    search(event) {
        const self = this;
        if (self.searchForm.value.searchTerm && self.searchForm.value.searchTerm.trim().length < 3) {
            if (event.type === 'submit') {

            } else {
                return;
            }
        }
        if (!self.searchForm.value.searchTerm || self.searchForm.value.searchTerm.trim() === '') {
            self.userList = [];
            // self.getTeamList();
            self.getUserList();
            self.getUserCount();
        } else {
            const options: GetOptions = {
                filter: { username: '/' + self.searchForm.value.searchTerm + '/' },
                noApp: true
            };
            self.commonService.get('user', '/usr', options).subscribe(res => {
                self.userList = res;
                // self.commonService.get('user','')
                self.userList.forEach(user => {
                    self.commonService.get('user', user._id + '/operations').subscribe(() => {
                    });
                });
            }, err => {
                self.commonService.errorToast(err);
            });
        }
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

    canEdit(user: UserDetails) {
        const self = this;
        if (user._id === self.commonService.userDetails._id || (user.isSuperAdmin && !self.commonService.userDetails.isSuperAdmin)) {
            return false;
        }
        return true;
    }

    canDelete(user: UserDetails) {
        const self = this;
        if (user._id === self.commonService.userDetails._id || (user.isSuperAdmin && !self.commonService.userDetails.isSuperAdmin)) {
            return false;
        }
        return true;
    }

    isThisUser(user) {
        return user._id === this.commonService.userDetails._id;
    }

    /** removeSelectedUsers method creates an array of Ids of all
     * selected users and then call rmUsrFromApp method by passing
     * that userId array as argument
     * @author bijay_ps
     */
    removeSelectedUsers() {
        const self = this;
        const selectedUsers = [];
        self.userList.forEach((usr) => {
            if (usr['checked']) {
                selectedUsers.push(usr._id);
            }
        });
        self.rmUsrFromApp(selectedUsers);
    }

    updateBreadCrumb(usr) {
        const self = this;
        if (self.breadcrumbPaths.length === 2) {
            self.breadcrumbPaths.pop();
        }
        self.breadcrumbPaths.push({
            active: true,
            label: usr
        });
    }

    /**
     * @param usrId (array of userIds)
     * @author bijay_ps
     */
    rmUsrFromApp(usrId) {
        const self = this;
        self.subscriptions['removeUsers'] = self.commonService
            .put('user', `/app/${self.commonService.app._id}/removeUsers`, { userIds: usrId })
            .subscribe(() => {
                self.initConfig();
                self.userList = [];
                // self.getTeamList();
                self.getUserList();
                self.getUserCount();
                self.ts.success(`Removed User(s) from ${self.selectedApp} App Successfully`);
            }, () => {
                self.ts.error('unable to remove selected user(s), please try after sometime');
            });
    }

    insufficientPermission() {
        const self = this;
        self.ts.warning('You don\'t have enough permissions');
    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
        if (self.applyingChangesModalRef) {
            self.applyingChangesModalRef.close();
        }
        if (self.newUserModalRef) {
            self.newUserModalRef.close();
        }
        if (self.deleteModalRef) {
            self.deleteModalRef.close();
        }
        if (self.createSuperAdminModalRef) {
            self.createSuperAdminModalRef.close();
        }
    }

    /**
     * Auth mode change code starts
     */

    getConfig() {
        const self = this;
        self.commonService.get('user', '/config', { filter: { 'auth.mode': self.authType }, noApp: true }).subscribe(res => {
            if (res && res.length > 0) {
                if (res[0].auth) {
                    self.config = res[0].auth.connectionDetails;
                }
                self.config.username = self.commonService.userDetails.username;
            }
            if (self.authType === 'azure' && !self.azureToken) {
                self.thirdPartyLogin(self.config).then(data => {
                    if (data.body) {
                        self.azureToken = data.body.adToken;
                    }
                }, err => {
                });
            }
        }, err => { });
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
        self.appService.ldapUserPass = self.reAuthenticatePassword;
        // self.toggleImportUsers = true;
        self.reAuthenticatePassword = null;
        self.openNewUserModal();
    }

    addLdapUser() {
        const self = this;
        self.reAuthenticateModalRef = self.commonService.modal(self.reAuthenticateModal);
        self.reAuthenticateModalRef.result.then(close => {
            if (!close) {
                self.reAuthenticatePassword = null;
            }
        }, dismiss => {
            self.reAuthenticatePassword = null;
        });
    }

    addAzureUser() {
        const self = this;
        self.config.username = self.commonService.userDetails.username;
        self.thirdPartyLogin(self.config).then(data => {
            if (data.body) {
                self.azureToken = data.body.adToken;
            }
            if (data.status === 200) {
                self.afterAuthenticate();
            } else {
                self.ts.error(data.body.message, null, { timeOut: 0, closeButton: true });
            }
        });
    }

    reAuthnticate() {
        const self = this;
        self.errorMessage = null;
        self.reAuthnticateLoader = true;
        self.commonService.login({
            username: self.commonService.userDetails.username,
            password: self.reAuthenticatePassword
        }).then(res => {
            self.reAuthenticateModalRef.close(true);
            self.reAuthnticateLoader = false;
            self.afterAuthenticate();
        }).catch(err => {
            self.reAuthnticateLoader = false;
            self.errorMessage = err.error.message;
        });
    }

    isAppAdmin(user: UserDetails) {
        const self = this;
        return !!(user.accessControl.apps
            && user.accessControl.apps.length > 0
            && user.accessControl.apps.find(e => e._id === self.commonService.app._id));

    }

    sortModelChange(model: any) {
        const self = this;
        self.userConfig.sort = self.appService.getSortQuery(model);
        self.loadMore({
            page: 1
        });
    }

    loadMore(data: any) {
        const self = this;
        self.userList = [];
        self.userConfig.page = data.page;
        self.getUserList();
        self.getUserCount();
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

    get checkAllUser() {
        const self = this;
        if (self.userList && self.userList.length > 0) {
            return self.userList.every(e => e.checked);
        }
        return false;
    }

    set checkAllUser(val) {
        const self = this;
        self.userList.forEach(e => {
            e.checked = val;
        });
    }

    get showCreateForm() {
        const self = this;
        if (self.authType === 'local' && !self.userInLocal) {
            return true;
        }
        return false;
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
