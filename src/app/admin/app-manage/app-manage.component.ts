import { Component, OnDestroy, OnInit, ViewChild, TemplateRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { App } from 'src/app/utils/interfaces/app';
import { AppService } from 'src/app/utils/services/app.service';
import { UserDetails } from 'src/app/utils/interfaces/userDetails';

@Component({
    selector: 'odp-app-manage',
    templateUrl: './app-manage.component.html',
    styleUrls: ['./app-manage.component.scss']
})
export class AppManageComponent implements OnInit, OnDestroy {

    @ViewChild('deleteModal', { static: false }) deleteModal: TemplateRef<HTMLElement>;
    activeTab: number;
    appData: App;
    servicesCount: number;
    oldData: App;
    subscriptions: any = {};
    userConfig: GetOptions = {};
    groupConfig: GetOptions = {};
    appUsers: Array<UserDetails> = []; // For displaying list of users not present in selected App
    userList: Array<UserDetails> = []; // For displaying list of users present in selected App
    tempList: Array<any> = []; // placeholder
    groupList: Array<any> = [];
    selectedGroup: any;
    addUserModal: boolean;
    groupUserList: Array<UserDetails> = [];
    filterUserText: string;
    allUsers: boolean;
    showLazyLoader: boolean;
    selectedUsersForAddition: Array<any> = [];
    deleteModalRef: NgbModalRef;
    toggleColorPicker: boolean;
    constructor(private renderer: Renderer2,
        private commonService: CommonService,
        private appService: AppService,
        private router: Router,
        private ts: ToastrService,
        private route: ActivatedRoute) {
        const self = this;
        self.activeTab = 1;
        self.appData = {};
        self.appData.appCenterStyle = {
            bannerColor: true,
            primaryColor: 'EB5F66',
            theme: 'light',
            textColor: 'FFFFFF'
        };
        self.appData.agentTrustedIP = {
            enabled: false,
            list: []
        };
        self.appData.logo = {};
        self.addUserModal = false;
        self.allUsers = false;
    }

    ngOnInit() {
        const self = this;
        self.userConfig.count = -1;
        self.userConfig.noApp = true;
        self.userConfig.filter = {};
        self.userConfig.select = 'basicDetails.name username email _metadata.lastUpdated';
        self.groupConfig.count = -1;
        self.groupConfig.noApp = true;
        self.groupConfig.select = 'name users';
        self.renderer.listen('body', 'keyup', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                self.onCancel();
            }
        });
        self.route.params.subscribe(params => {
            self.getApp(params.id);
            self.getServicesCount(params.id);
            self.getGroups(params.id);
        });
    }

    onCancel() {
        const self = this;
        if (self.addUserModal) {
            self.addUserModal = false;
            self.allUsers = false;
            self.selectedUsersForAddition = [];
        }
    }

    getApp(id: string) {
        const self = this;
        self.commonService.get('user', '/app/' + id, { noApp: true }).subscribe(res => {
            self.tempList = res.users;
            self.appData = Object.assign(self.appData, res);
            self.oldData = self.appService.cloneObject(self.appData);
            self.getUserDetail();
        }, err => {

        });
    }

    getUserDetail() {
        const self = this;
        self.subscriptions['userDetails'] = self.commonService.get('user', `/${self.appData._id}/user`, { noApp: true, count: -1 })
            .subscribe(res => {
                if (res.length > 0) {
                    self.userList = res;
                }
            }, err => {
                self.commonService.errorToast(err, 'Unable to fetch users, please try again later');
            });
    }

    otherAppUsers() {
        const self = this;
        self.addUserModal = true;
        const existingUserIds = [];
        self.userList.forEach(e => existingUserIds.push(e._id));
        const config = {
            count: -1,
            noApp: true,
            filter: {
                _id: { $nin: existingUserIds }
            }
        };
        self.subscriptions['userlist'] = self.commonService.get('user', '/admin/user', config).subscribe((res: Array<UserDetails>) => {
            if (res.length > 0) {
                res.forEach(u => {
                    u.checked = false;
                });
                self.appUsers = res;
            }
        }, err => {
            self.commonService.errorToast(err, 'Unable to fetch users, please try again later');
        });
    }

    toggleUserSelection(user) {
        const self = this;
        if (!user.checked) {
            self.selectUsr(user);
        } else {
            self.deSelectUsr(user);
        }
    }

    selectUsr(user) {
        const self = this;
        user.checked = !user.checked;
        self.allUsers = self.appUsers.every(e => e.checked);
        const userIndex = self.selectedUsersForAddition.findIndex(e => e === user._id);
        if (userIndex >= 0) {
            return;
        } else {
            self.selectedUsersForAddition.push(user._id);
        }
    }

    deSelectUsr(user) {
        const self = this;
        const idx = self.selectedUsersForAddition.findIndex(e => e === user._id);
        if (idx >= 0) {
            self.selectedUsersForAddition.splice(idx, 1);
        }
        user.checked = !user.checked;
        const i = self.appUsers.findIndex(e => e.checked === false);
        if (i > 0) {
            self.allUsers = false;
        }
    }

    selectAllUsrs() {
        const self = this;
        if (self.allUsers) {
            self.appUsers.forEach(e => e['checked'] = true);
            self.selectedUsersForAddition = [];
            self.appUsers.forEach(e => self.selectedUsersForAddition.push(e._id));
        } else {
            self.appUsers.forEach(e => e['checked'] = false);
            self.selectedUsersForAddition = [];
        }
    }

    getServicesCount(app: string) {
        const self = this;
        const options = {
            noApp: true,
            filter: {
                app: `${app}`
            }
        };
        self.commonService.get('serviceManager', `/${this.commonService.app._id}/service/utils/count`, options).subscribe(res => {
            self.servicesCount = res;
        }, err => {

        });
    }

    imageUpload(event, type) {
        const self = this;
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (type === 'logo') {
                self.appData.logo.full = reader.result.toString();
            } else {
                self.appData.logo.thumbnail = reader.result.toString();
            }
        };
        reader.onerror = (error) => {
            console.error(error);
        };
    }

    save() {
        const self = this;
        if (!this.changesDone) {
            return;
        }
        self.commonService.put('user', '/app/' + self.appData._id, self.appData).subscribe(res => {
            self.oldData = self.appService.cloneObject(self.appData);
            self.ts.success('App saved successfully');
            self.router.navigate(['/admin']);
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    delete() {
        const self = this;
        self.deleteModalRef = self.commonService.modal(self.deleteModal);
        self.deleteModalRef.result.then(close => {
            self.commonService.delete('user', '/app/' + self.appData._id).subscribe(res => {
                self.ts.success('App deleted successfully');
                self.router.navigate(['/admin']);
            }, err => {
                self.commonService.errorToast(err);
            });
        }, dismiss => {

        });
    }

    get selectedColorStyle() {
        const self = this;
        return {
            background: '#' + self.appData.appCenterStyle.primaryColor
        };
    }

    get changesDone() {
        const self = this;
        if (JSON.stringify(self.appData) === JSON.stringify(self.oldData)) {
            return false;
        } else {
            return true;
        }
    }

    getLastActiveTime(time) {
        if (time) {
            const lastLoggedIn = new Date(time);
            return moment(lastLoggedIn).fromNow() === 'a day ago' ? '1 day ago' : moment(lastLoggedIn).fromNow();
        }
        return;
    }

    isThisUser(user) {
        if (user._id === this.commonService.userDetails._id) {
            return true;
        }
        return false;
    }

    getGroups(appId) {
        const self = this;
        self.groupConfig.filter = {
            app: appId
        };
        self.commonService.get('user', `/${this.commonService.app._id}/group`, self.groupConfig).subscribe(res => {
            if (res.length > 0) {
                self.groupList = res;
                const index = self.groupList.findIndex(e => e.name === '#');
                if (index >= 0) {
                    self.groupList.splice(index, 1);
                }
                self.selectedGroup = self.groupList[0];
                self.getUsers();
            }
        }, err => {
            self.commonService.errorToast(err, 'Unable to fetch  groups, please try again later');
        });
    }

    getUsers() {
        const self = this;
        if (self.selectedGroup && self.selectedGroup.length > 0) {
            self.userConfig.filter['_id'] = { $in: self.selectedGroup.users };
            // self.selectGroupuserList = [];
            self.subscriptions['getuserlist'] = self.commonService.get('user', '/admin/user', self.userConfig).subscribe(res => {
                if (res.length > 0) {
                    self.groupUserList = res;
                }
            }, err => {
                self.commonService.errorToast(err, 'Unable to fetch users, please try again later');
            });
        }
    }

    addSelectedUsers() {
        const self = this;
        if (self.selectedUsersForAddition.length > 0) {
            const payload = { users: self.selectedUsersForAddition };
            self.subscriptions['userAddition'] = self.commonService
                .put('user', `/app/${self.appData._id}/addUsers`, payload)
                .subscribe(() => {
                    self.onCancel();
                    self.getUserDetail();
                    self.ts.success(`User(s) successfully added to ${self.appData._id} App`);
                }, (err) => {
                    self.onCancel();
                    self.ts.warning(err.error.message);
                });
        } else {
            self.ts.warning('Please Select at least one user to proceed');
        }
    }

    ngOnDestroy() {
        const self = this;
        if (self.deleteModalRef) {
            self.deleteModalRef.close();
        }
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
    }

    isAppAdmin(user: UserDetails) {
        const self = this;
        if (user.accessControl
            && user.accessControl.apps
            && user.accessControl.apps.length > 0
            && user.accessControl.apps.find(e => e._id === self.appData._id)) {
            return true;
        }
        return false;
    }
}
