import { Component, OnInit, Input, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { UserDetails } from 'src/app/utils/interfaces/userDetails';
import { DataGridColumn } from 'src/app/utils/data-grid/data-grid.directive';

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
    searchTable: string;
    searchedUsers: Array<any>;
    selectedUsersList: Array<any>;
    searchUsersModalRef: NgbModalRef;
    searchTerm: string;
    showSelected: boolean;
    showLazyLoader: boolean;
    tableColumns: Array<DataGridColumn>;
    totalRecords: number;
    currentPage: number;
    pageSize: number;
    constructor(private commonService: CommonService,
        private appService: AppService) {
        const self = this;
        self.subscriptions = {};
        self.userList = [];
        self.searchedUsers = [];
        self.selectedUsersList = [];
        self.tableColumns = [];
        self.totalRecords = 0;
        self.currentPage = 1;
        self.pageSize = 30;
    }

    ngOnInit() {
        const self = this;
        if (self.hasPermission('PMGMUD')) {
            self.tableColumns.push({
                label: '#',
                checkbox: true,
                dataKey: '_checkbox',
                show: true
            });
        }
        self.tableColumns.push({
            label: 'Name',
            dataKey: 'basicDetails.name',
            show: true,
            width: 300
        });
        self.tableColumns.push({
            label: 'Username',
            dataKey: 'username',
            show: true,
            width: 300
        });
        self.tableColumns.push({
            label: 'Groups',
            dataKey: 'groups',
            show: true
        });
        if (self.users) {
            self.userList = self.users.filter(e => !e.bot);
        }
        self.totalRecords = self.userList.length;
        self.pageSize = self.userList.length;
        self.userList.forEach(user => {
            self.getUserGroups(user);
        });
    }

    ngOnDestroy() {
        const self = this;
        if (self.searchUsersModalRef) {
            self.searchUsersModalRef.close();
        }
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
            if (!res || res.length === 0) {
                user.groups = 'None';
            } else {
                user.groups = res.map(e => e.name).join(' ,');
            }
        }, err => {
            user.groups = 'ERROR';
        });
    }

    isThisUser(user: any) {
        const self = this;
        return self.commonService.userDetails._id === user._id;
    }

    searchUsers(searchTerm: string) {
        const self = this;
        const options = {
            filter: {
                '$or': [
                    { 'basicDetails.name': '/' + searchTerm + '/' },
                    { 'username': '/' + searchTerm + '/' }
                ]
            },
            select: 'username,basicDetails.name,accessControl.apps,bot',
            count: 30,
            noApp: true
        };
        self.searchTerm = searchTerm;
        self.subscriptions['searchUsers'] = self.commonService
            .get('user', `/usr/app/${self.commonService.app._id}/`, options)
            .subscribe(res => {
                self.searchedUsers = res;
                self.searchedUsers.forEach(user => {
                    if (self.selectedUsersList.find(u => u._id === user._id)) {
                        user.selected = true;
                    }
                    self.getUserGroups(user);
                });
            }, err => {
                self.commonService.errorToast(err, 'Unable to fetch users, please try again later');
            });
    }

    addUsers() {
        const self = this;
        self.selectedUsersList.forEach(user => {
            user.selected = false;
        });
        self.userList = self.userList.concat(self.selectedUsersList).filter((u, i, a) => a.findIndex(x => x._id === u._id) === i);
        self.clearBrowse();
        self.rebuildUsersArray();
        self.showLazyLoader = false;
    }

    clearSearch() {
        const self = this;
        self.searchedUsers = [];
        self.searchTerm = null;
        self.showSelected = false;
    }

    clearBrowse() {
        const self = this;
        self.searchedUsers = [];
        self.selectedUsersList = [];
        self.showSelected = false;
        self.searchUsersModalRef.close(true);
    }

    showBrowseTab() {
        const self = this;
        self.searchUsersModalRef = self.commonService.modal(self.searchUsersModal, { centered: true, size: 'lg' });
        self.searchUsersModalRef.result.then(close => {
            self.clearBrowse();
        }, dismiss => {
            self.clearBrowse();
        });
    }

    toggleSearchedUser(event: Event, user: any) {
        const self = this;
        const target = <HTMLInputElement>event.target;
        if (target.checked) {
            user.selected = true;
            self.selectedUsersList.push(user);
        } else {
            user.selected = false;
            const index = self.selectedUsersList.findIndex(u => u._id === user._id);
            self.selectedUsersList.splice(index, 1);
        }
    }

    removeFromSelected(index: number) {
        const self = this;
        self.selectedUsersList.splice(index, 1);
    }


    removeUsers() {
        const self = this;
        const temp = self.appService.cloneObject(self.selectedUsers);
        temp.forEach(user => {
            let index = self.userList.findIndex(u => u._id === user._id);
            if (index > -1) {
                self.userList.splice(index, 1);
            }
            index = self.users.findIndex(u => u._id === user._id);
            if (index > -1) {
                self.users.splice(index, 1);
            }
        });
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

    get toggleUserSelectionAll() {
        const self = this;
        if (self.searchedUsers.length > 0) {
            return Math.min.apply(null, self.searchedUsers.map(user => user.selected));
        }
        return false;
    }

    set toggleUserSelectionAll(val) {
        const self = this;
        self.searchedUsers.forEach(user => {
            user.selected = val;
        });
        self.searchedUsers.forEach(user => {
            const index = self.selectedUsersList.findIndex(u => u._id === user._id);
            if (val) {
                if (index < 0) {
                    self.selectedUsersList.push(user);
                }
            } else {
                if (index > -1) {
                    self.selectedUsersList.splice(index, 1);
                }
            }
        });
    }

    get checkAll() {
        const self = this;

        if (!self.hasPermission('PMGMUD')) {
            return undefined;
        }
        if (self.userList && self.userList.length > 0) {
            return Math.min.apply(null, self.userList.map(u => u.selected));
        } else {
            return false;
        }
    }

    set checkAll(val) {
        const self = this;
        self.userList.map(u => u.selected = val);
    }

    get selectedUsers() {
        const self = this;
        return self.userList.filter(u => u.selected);
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
