import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { App } from 'src/app/utils/interfaces/app';
import * as _ from 'lodash'

@Component({
    selector: 'odp-user-apps',
    templateUrl: './user-apps.component.html',
    styleUrls: ['./user-apps.component.scss'],
    animations: [
        trigger('slideIn', [
            state('void', style({
                left: '25vw'
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
                        opacity: .5,
                        transform: 'translateX(80px)'
                    }),
                    style({
                        opacity: .2,
                        transform: 'translateX(100px)'
                    }),
                    style({
                        opacity: 0
                    })
                ]))
            ])
        ]),
        trigger('slideOut', [
            state('void', style({
                right: '25vw'
            })),
            transition('void => *', [
                animate('400ms ease-in', keyframes([
                    style({
                        opacity: 0,
                        transform: 'translateX(-80px)'
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
                        opacity: .2,
                        transform: 'translateX(-80px)'
                    }),
                    style({
                        opacity: .1,
                        transform: 'translateX(-100px)'
                    }),
                    style({
                        opacity: 0
                    })
                ]))
            ])
        ])
    ]
})
export class UserAppsComponent implements OnInit, OnDestroy {

    private _user: any;
    get user() {
        return this._user;
    }

    @Input() set user(value: any) {
        this._user = value;
    }
    @Input() apps: any;
    @ViewChild('assignAppModal', { static: false }) assignAppModal;
    selectUserType: string;
    selectedApp: string;
    appList: Array<App>;
    appOptions: any;
    apiConfig: GetOptions;
    filterAppStr = '';
    userApps: Array<any> = [];
    userAppConfig: GetOptions = {};
    subscriptions: any;
    deleteModal: DeleteModalConfig;
    prvlgChng: DeleteModalConfig;
    @ViewChild('deleteModalTemplate', { static: false }) deleteModalTemplate;
    @ViewChild('superAdminTemplate', { static: false }) superAdminTemplate;
    deleteModalTemplateRef: NgbModalRef;
    superAdminTemplateRef: NgbModalRef;
    assignAppModalRef: NgbModalRef;
    showLazyLoader: boolean;
    constructor(private commonService: CommonService,
        private ts: ToastrService) {
        const self = this;
        self.appList = [];
        self.apiConfig = {};
        self.subscriptions = {};
        self.deleteModal = {
            title: 'Delete record(s)',
            message: 'Are you sure you want to delete self recordOa(s)?',
            falseButton: 'No',
            trueButton: 'Yes',
            showButtons: true
        };
        self.prvlgChng = {
            title: 'Make SuperAdmin',
            message: 'Are you sure you want to grant Super Admin privileges?',
            falseButton: 'No',
            trueButton: 'Yes',
            showButtons: true
        };
    }

    ngOnInit() {
        const self = this;
        // self.selectApp(0);
        self.apiConfig.count = -1;
        self.apiConfig.select = 'name logo.thumbnail';
        self.apiConfig.noApp = true;
        self.apiConfig.sort = '_id';
        self.userAppConfig.noApp = true;
        self.userAppConfig.count = -1;
        self.userAppConfig.sort = '_id';
        self.appOptions = {};
        self.appList.forEach(app => {
            app.selected = false;
            // if (!app.logo || !app.logo.thumbnail) {
            self.getAppDetails(app);
            // }
        });
        if (!self.user.accessControl) {
            self.user.accessControl = {};
        }
        if (self.user.accessControl.apps) {
            self.userApps = self.user.accessControl.apps.slice(0); // creating copy of array
        } else {
            self.userApps = [];
        }
        self.selectUserType = self.user.isSuperAdmin ? 'superadmin' : 'user';
        if (self.selectUserType === 'user') {
            self.getUserApps();
        }
    }

    get typeUser() {
        const self = this;
        return self.selectUserType === 'user';
    }

    get typeSuperAdmin() {
        const self = this;
        return self.selectUserType === 'superadmin';
    }


    setAsSuperAdmin() {
        const self = this;
        self.showLazyLoader = true;
        self.subscriptions['setSuperAdmin'] = self.commonService.put('user', `/admin/user/${self.user._id}/superAdmin/grant`, {})
            .subscribe(() => {
                self.showLazyLoader = false;
                self.selectUserType = 'superadmin';
                self.user.isSuperAdmin = true;
                self.ts.success(`User ${self.user.basicDetails.name} has been successfully granted SuperAdmin privileges`);
            }, (err) => {
                self.showLazyLoader = false;
                self.selectUserType = 'user';
                self.ts.error(err.error.message);
            });
    }

    confirmSuperAdminAccess() {
        const self = this;
        self.prvlgChng.title = 'Make SuperAdmin';
        self.prvlgChng.message = `Are you sure you want to grant user ${self.user.basicDetails.name} Super Admin Privileges?`;
        self.prvlgChng.showButtons = true;
        self.superAdminTemplateRef = self.commonService.modal(self.superAdminTemplate);
        self.superAdminTemplateRef.result.then((close) => {
            if (close) {
                self.setAsSuperAdmin();
            }
        }, dismiss => { });
    }

    setAsNormalUser() {
        const self = this;
        self.showLazyLoader = true;
        self.subscriptions['removeSuperAdmin'] = self.commonService.put('user', `/admin/user/${self.user._id}/superAdmin/revoke`, {})
            .subscribe(() => {
                self.showLazyLoader = false;
                self.selectUserType = 'user';
                self.user.isSuperAdmin = false;
                self.getUserApps();
                self.ts.success(`User ${self.user.basicDetails.name}'s SuperAdmin privileges  has been successfully revoked`);
            }, (err) => {
                self.showLazyLoader = false;
                self.selectUserType = 'superadmin';
                self.ts.error(err.error.message);
            });
    }

    revokeSuperAdminAccess() {
        const self = this;
        self.prvlgChng.title = 'Revoke SuperAdmin Access';
        self.prvlgChng.message = `Are you sure you want to revoke user ${self.user.basicDetails.name}'s Super Admin Privileges?`;
        self.prvlgChng.showButtons = true;
        self.superAdminTemplateRef = self.commonService.modal(self.superAdminTemplate);
        self.superAdminTemplateRef.result.then((close) => {
            if (close) {
                self.setAsNormalUser();
            }
        }, dismiss => { });
    }

    assignApp() {
        const self = this;
        self.getApps();
        self.assignAppModalRef = self.commonService.modal(self.assignAppModal, { windowClass: 'assignApp-modal', centered: true });
        self.assignAppModalRef.result.then((close) => {
            if (close) {
                const appPayload = { apps: [] };
                appPayload.apps = self.appList.filter(e => e.selected).map(e => e._id);
                self.showLazyLoader = true;
                self.subscriptions['assignApp'] = self.commonService.put('user', `/admin/user/utils/addToApps/${self.user._id}`, appPayload)
                    .subscribe(() => {
                        self.showLazyLoader = false;
                        self.getUserApps();
                    }, (err) => {
                        self.showLazyLoader = false;
                        self.ts.error(err.error.message);
                    });
            }
        }, (dismiss) => {
            self.appList = [];
        });
    }

    grantAppAdmin(userAppID) {
        const self = this;
        const appPayload = { apps: [] };
        appPayload.apps.push(userAppID);
        self.showLazyLoader = true;
        self.subscriptions['appAdmin'] = self.commonService.put('user', `/admin/user/utils/appAdmin/${self.user._id}/grant`, appPayload)
            .subscribe(() => {
                self.showLazyLoader = false;
                appPayload.apps.forEach((e) => {
                    self.userApps.push({ _id: e, type: 'Management' });
                });
                self.ts.success('User successfully granted App Admin privileges');
                if (self.user.accessControl.apps === null) {
                    self.user.accessControl.apps = [];
                }
                self.user.accessControl.apps.push({ _id: userAppID, type: 'Management' });
                self.getUserApps();
            }, (err) => {
                self.showLazyLoader = false;
                self.ts.error(err.error.message);
            });
    }

    revokeAppAdmin(userAppID) {
        const self = this;
        const appPayload = { apps: [] };
        appPayload.apps.push(userAppID);
        self.showLazyLoader = true;
        self.commonService.put('user', `/admin/user/utils/appAdmin/${self.user._id}/revoke`, appPayload)
            .subscribe(() => {
                self.showLazyLoader = false;
                self.ts.warning('User Admin Access privileges revoked');
                const index = self.user.accessControl.apps.findIndex(e => e._id === userAppID);
                self.user.accessControl.apps.splice(index, 1);
                self.getUserApps();
            }, (err) => {
                self.showLazyLoader = false;
                self.ts.error(err.error.message);
            });
    }

    removeUserAdminAccess(app) {
        const self = this;
        self.deleteModal.title = 'Remove App Admin Access';
        self.deleteModal.message = `Are you sure you want to remove ${self.user.basicDetails.name} App Admin privileges?`;
        self.deleteModal.showButtons = true;
        self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
        self.deleteModalTemplateRef.result.then((close) => {
            if (close) {
                self.revokeAppAdmin(app);
            }
        }, dismiss => { });
    }

    removeUserAccessForApp(appId) {
        const self = this;
        const payload = { userIds: [self.user._id] };
        self.showLazyLoader = true;
        self.subscriptions['removeAppForUser'] = self.commonService.put('user', `/${appId}/user/utils/removeUsers`, payload)
            .subscribe(() => {
                self.showLazyLoader = false;
                const appIndex = self.userApps.findIndex(e => e._id === appId);
                if (appIndex >= 0) {
                    self.userApps.splice(appIndex, 1);
                }
                self.ts.success(`User access for App${appId} has been revoked`);
            }, (err) => {
                self.showLazyLoader = false;
                self.ts.error(err.error.message);
            });
    }

    confirmRemoveAction(appId) {
        const self = this;
        self.deleteModal.title = 'Remove User Access';
        self.deleteModal.message = `Are you sure you want to remove ${self.user.basicDetails.name} access for App ${appId}?`;
        self.deleteModal.showButtons = true;
        self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
        self.deleteModalTemplateRef.result.then((dismiss) => {
            if (dismiss) {
                self.removeUserAccessForApp(appId);
            }
        }, dismiss => { });
    }

    getAppDetails(app: App) {
        const self = this;
        self.showLazyLoader = true;
        self.subscriptions['appDtl'] = self.commonService.get('user', '/admin/app/' + app._id, { noApp: true })
            .subscribe((res: any) => {
                self.showLazyLoader = false;
                app = Object.assign(app, res);
            }, err => {
                self.showLazyLoader = false;
                if (err.status === 404) {
                    const index = self.appList.findIndex(e => e._id === app._id);
                    self.appList.splice(index, 1);
                }
            });
    }

    getApps() {
        const self = this;
        const notReqApps = self.userApps.map(e => e._id);
        self.apiConfig.filter = { _id: { $nin: notReqApps } };
        self.showLazyLoader = true;
        self.subscriptions['apps'] = self.commonService.get('user', '/admin/app', self.apiConfig).subscribe(res => {
            self.showLazyLoader = false;
            self.appList = [];
            res.forEach(item => {
                self.appList.push(item);
            });
        }, () => {
            self.showLazyLoader = false;
            self.ts.error('Unable to fetch Apps');
        });
    }

    getUserApps() {
        const self = this;
        self.showLazyLoader = true;
        self.subscriptions['userApps'] = self.commonService.get('user', '/data/' + self.user._id + '/appList', self.userAppConfig)
            .subscribe(res => {
                self.showLazyLoader = false;
                if (res.apps && res.apps.length > 0) {
                    res.apps.forEach((app) => {
                        self.userApps.push({ _id: app, type: 'Management' });
                    });
                } else {
                    self.userApps = [];
                }
                self.userApps = self.userApps.filter((e, i, a) => a.findIndex(ele => ele._id === e._id) === i);
                self.userApps.forEach(app => {
                    self.getAppLogo(app);
                });
            }, err => {
                self.showLazyLoader = false;
            });
    }

    getAppLogo(app: App) {
        const self = this;
        const option: GetOptions = { select: 'logo.thumbnail', noApp: true };
        self.subscriptions['getAppLogo_' + app._id] = self.commonService.get('user', '/admin/app/' + app._id, option)
            .subscribe((res) => {
                app.logo = res.logo;
                app.firstLetter = app._id.charAt(0);
                app.bg = this.appColor();
                if (_.isEmpty(app.logo)) {
                    delete app.logo;
                }
            }, err => {
                if (err.status === 404) {
                    const index = self.userApps.findIndex(e => e._id === app._id);
                    self.userApps.splice(index, 1);
                }
            });
    }

    ifAppAdmin(appInQues) {
        const self = this;
        if (self.user.accessControl.apps && self.user.accessControl.apps.length > 0) {
            const index = self.user.accessControl.apps.findIndex(e => e._id === appInQues);
            return index >= 0;
        }
        return false;
    }

    get markedApp() {
        const self = this;
        return self.appList.filter(e => e.selected).map(e => e._id).slice(0, 2).join(', '); // Will return the first 3 elements of the array
    }

    get selectedApps() {
        const self = this;
        return self.appList.filter(e => e.selected);
    }

    appSearch(filterStr) {
        const self = this;
        self.filterAppStr = filterStr;
    }

    resetApp() {
        const self = this;
        self.filterAppStr = '';
    }
    ngOnDestroy(): void {
        const self = this;
        if (self.deleteModalTemplateRef) {
            self.deleteModalTemplateRef.close();
        }
        if (self.superAdminTemplateRef) {
            self.superAdminTemplateRef.close();
        }
        if (self.assignAppModalRef) {
            self.assignAppModalRef.close();
        }
    }
    appColor() {
        const colorArray = [
            '#B2DFDB',
            '#B2EBF2',
            '#B3E5FC',
            '#A5D6A7',
            '#C5E1A5',
            '#E6EE9C',
        ];
        return _.sample(colorArray);
    }
}
