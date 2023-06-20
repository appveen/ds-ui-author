import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { Group } from 'src/app/utils/interfaces/group';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';

@Component({
    selector: 'odp-user-group',
    templateUrl: './user-group.component.html',
    styleUrls: ['./user-group.component.scss']
})
export class UserGroupComponent implements OnInit, OnDestroy {
    apiConfig: GetOptions;
    subscriptions: any;
    showLazyLoader: boolean;
    groupList: Array<Group>;
    searchTerm: string;
    newGroup: Group;
    filterGroupText = '';
    totalRecords: number;
    form: UntypedFormGroup;
    showNewGroupWindow: boolean;
    breadcrumbPaths: Array<Breadcrumb>;

    constructor(private commonService: CommonService,
        private router: Router,
        private fb: UntypedFormBuilder) {
        this.subscriptions = {};
        this.breadcrumbPaths = [];
        this.groupList = [];
        this.newGroup = {};
        this.form = this.fb.group({
            name: ["", [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
            description: ["", [Validators.maxLength(240), Validators.pattern(/\w+/)]]
        });
    }

    ngOnInit() {
        this.resetSearch();
        this.breadcrumbPaths.push({
            active: true,
            label: 'Groups',
        });
        this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    }

    ngOnDestroy() {
    }

    getGroupCount() {
        this.showLazyLoader = true;
        if (this.subscriptions['getGroupCount']) {
            this.subscriptions['getGroupCount'].unsubscribe();
        }
        this.subscriptions['getGroupCount'] = this.commonService
            .get('user', `/${this.commonService.app._id}/group/count`, this.apiConfig)
            .subscribe(res => {
                this.totalRecords = res;
            }, err => {
                this.showLazyLoader = false;
                this.commonService.errorToast(err, 'Unable to fetch groups, please try again later');
            });
    }

    getGroupList() {
        this.showLazyLoader = true;
        if (this.subscriptions['getGroupList']) {
            this.subscriptions['getGroupList'].unsubscribe();
        }
        this.subscriptions['getGroupList'] = this.commonService
            .get('user', `/${this.commonService.app._id}/group`, this.apiConfig)
            .subscribe(res => {
                this.showLazyLoader = false;
                res.forEach(item => {
                    const usersLen = item.users.filter(e =>e.lastIndexOf('-') != 23);
                    item.membersCount = usersLen.length;
                    item.botsCount = Math.abs(usersLen.length - item.users.length);

                    const authorPermissions = item.roles.filter(e => e.id.match(/^[A-Z]{2,}$/));
                    item.hasAuthorRoles = authorPermissions.length > 0;
                    item.hasAppcenterRoles = authorPermissions.length != item.roles.length;

                    this.groupList.push(item);
                    const index = this.groupList.findIndex(e => e.name === '#');
                    if (index >= 0) {
                        this.groupList.splice(index, 1);
                    }
                });
            }, err => {
                this.showLazyLoader = false;
                this.commonService.errorToast(err, 'Unable to fetch groups, please try again later');
            });
    }

    searchGroup(value) {
        this.apiConfig.page = 1;
        if (!value || !value.trim()) {
            return;
        }

        if (!this.apiConfig.filter) {
            this.apiConfig.filter = {};
        }
        this.apiConfig.filter.name = '/' + value.trim() + '/';
        this.groupList = [];
        this.getGroupList();
        this.getGroupCount();
    }

    resetSearch() {
        this.apiConfig = {
            page: 1,
            count: -1,
            filter: {},
            select: 'name users roles.id',
            noApp: true
        };
        this.groupList = [];
        this.getGroupList();
        this.getGroupCount();
    }

    loadMore(event: any) {
        if (event.target.scrollTop + event.target.offsetHeight === event.target.scrollHeight
            && this.totalRecords - 1 !== this.groupList.length) {
            this.apiConfig.page = this.apiConfig.page + 1;
            this.showLazyLoader = true;
            this.getGroupList();
        }
    }
    addNewGroup() {
        this.showNewGroupWindow = true;
        this.form.reset({ name: this.searchTerm });
    }
    createGroup() {
        if (this.form.valid) {
            const payload = this.form.value;
            payload.app = this.commonService.app._id;
            this.showLazyLoader = true;
            this.subscriptions['createGroup'] = this.commonService.post('user', `/${this.commonService.app._id}/group/`, payload).subscribe(res => {
                this.newGroup = {};
                this.showLazyLoader = false;
                this.showNewGroupWindow = false;
                this.router.navigate(['/app', this.commonService.app._id, 'cp', 'gm', res._id]);
            }, err => {
                this.showLazyLoader = false;
                this.commonService.errorToast(err);
            });
        }
    }

    hasPermission(type: string) {
        return this.commonService.hasPermission(type);
    }
}
