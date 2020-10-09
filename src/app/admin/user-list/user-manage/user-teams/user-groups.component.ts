import { Component, Input, OnInit } from '@angular/core';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'odp-user-groups',
    templateUrl: './user-groups.component.html',
    styleUrls: ['./user-groups.component.scss']
})
export class UserGroupsComponent implements OnInit {

    @Input() user: any;
    selectedApp: string;
    showGroupList: boolean;
    groupList: Array<any> = [];
    subscriptions: any = {};
    filterStr = '';
    userApps: Array<any> = [];
    userAppConfig: GetOptions = {};
    userAppGroupConfig: GetOptions = {};
    showLazyLoader: boolean;
    showSpinner: boolean;
    constructor(private commonService: CommonService,
        private ts: ToastrService) {
        const self = this;
        self.showGroupList = false;
    }

    ngOnInit() {
        const self = this;
        self.userAppConfig.noApp = true;
        self.userAppConfig.count = -1;
        self.userAppGroupConfig.noApp = true;
        self.userAppGroupConfig.count = -1;
        self.userAppGroupConfig.filter = {};
        self.getUserApps();
    }

    /**
     * Retrieve the Apps for which user has access
     */
    getUserApps() {
        const self = this;
        self.showSpinner = true;
        self.subscriptions['userApps'] = self.commonService.get('user', '/usr/' + self.user._id + '/appList', self.userAppConfig)
            .subscribe(res => {
                self.showSpinner = false;
                const temp = [];
                if (res.apps && res.apps.length > 0) {
                    res.apps.forEach((app) => {
                        temp.push({ _id: app, type: 'Management' });
                    });
                }
                if (!self.user.accessControl) {
                    self.user.accessControl = {};
                }
                if (self.user.accessControl && !self.user.accessControl.apps) {
                    self.user.accessControl.apps = [];
                }
                self.userApps = self.user.accessControl.apps.concat(temp);
                self.userApps = self.userApps.filter((e, i, a) => a.findIndex(ele2 => ele2._id === e._id) === i);
                self.selectApp(0);
            }, err => {
                self.showSpinner = false;
                self.commonService.errorToast(err);
            });
    }

    selectApp(appIndex) {
        const self = this;
        if (self.userApps && self.userApps.length > 0) {
            self.selectedApp = self.userApps[appIndex]._id;
        }
        self.getAppGroups();
    }
    /**
     * Retrieve the groups for an App for which user has access
     */
    getAppGroups() {
        const self = this;
        self.userAppGroupConfig.filter = { app: self.selectedApp, users: self.user._id };
        self.showLazyLoader = true;
        self.subscriptions['userGroupForApp'] = self.commonService.get('user', '/group', self.userAppGroupConfig)
            .subscribe((groups) => {
                self.showLazyLoader = false;
                self.groupList = [];
                self.groupList = groups;
                const index = self.groupList.findIndex(e => e.name === '#');
                if (index >= 0) {
                    self.groupList.splice(index, 1);
                }
            }, (err) => {
                self.showLazyLoader = false;
                self.commonService.errorToast(err);
            });
    }

    queryStr(str) {
        const self = this;
        self.filterStr = str;
    }

    render() {
        const self = this;
        self.filterStr = '';
    }

    get dummyRows() {
        const arr = new Array(10);
        arr.fill(1);
        return arr;
    }
}
