import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { Group } from 'src/app/utils/interfaces/group';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
    selector: 'odp-user-group',
    templateUrl: './user-group.component.html',
    styleUrls: ['./user-group.component.scss']
})
export class UserGroupComponent implements OnInit, OnDestroy {
    @ViewChild('newGroupModal', { static: false }) newGroupModal: TemplateRef<HTMLElement>;
    apiConfig: GetOptions;
    subscriptions: any;
    showLazyLoader: boolean;
    groupList: Array<Group>;
    searchTerm: string;
    newGroupModalRef: NgbModalRef;
    newGroup: Group;
    breadcrumbPaths: Array<Breadcrumb>;
    filterGroupText = '';
    totalRecords: number;
    form: FormGroup;

    constructor(private commonService: CommonService,
        private router: Router,
        private fb: FormBuilder) {
        const self = this;
        self.subscriptions = {};
        self.groupList = [];
        self.newGroup = {};
        self.breadcrumbPaths = [];
        self.form = self.fb.group({
            name: ["", [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
            description: ["", [Validators.maxLength(240), Validators.pattern(/\w+/)]]
        });
    }

    ngOnInit() {
        const self = this;
        self.breadcrumbPaths.push({
            active: true,
            label: 'Groups'
        });
        self.resetSearch();

    }

    ngOnDestroy() {
        const self = this;
        if (self.newGroupModalRef) {
            self.newGroupModalRef.close();
        }
    }

    getGroupCount() {
        const self = this;
        self.showLazyLoader = true;
        if(self.subscriptions['getGroupCount']){
            self.subscriptions['getGroupCount'].unsubscribe();
        }
        self.subscriptions['getGroupCount'] = self.commonService
            .get('user', `/${self.commonService.app._id}/group/count`, self.apiConfig)
            .subscribe(res => {
                self.totalRecords = res;
            }, err => {
                self.showLazyLoader = false;
                self.commonService.errorToast(err, 'Unable to fetch groups, please try again later');
            });
    }

    getGroupList() {
        const self = this;
        self.showLazyLoader = true;
        if(self.subscriptions['getGroupList']){
            self.subscriptions['getGroupList'].unsubscribe();
        }
        self.subscriptions['getGroupList'] = self.commonService
            .get('user', `/${self.commonService.app._id}/group`, self.apiConfig)
            .subscribe(res => {
                self.showLazyLoader = false;
                res.forEach(item => {
                    self.groupList.push(item);
                    const index = self.groupList.findIndex(e => e.name === '#');
                    if (index >= 0) {
                        self.groupList.splice(index, 1);
                    }
                });
            }, err => {
                self.showLazyLoader = false;
                self.commonService.errorToast(err, 'Unable to fetch groups, please try again later');
            });
    }

    searchGroup(value) {
        const self = this;
        self.apiConfig.page = 1;
        if (!value || !value.trim()) {
            return;
        }
       
        if (!self.apiConfig.filter) {
            self.apiConfig.filter = {};
        }
        self.apiConfig.filter.name = '/' + value.trim() + '/';
        self.groupList = [];
        self.getGroupList();
        self.getGroupCount();
    }

    resetSearch() {
        const self = this;
        self.apiConfig = {
            page: 1,
            count: 30,
            filter: {},
            select: 'name users',
            noApp: true
        };
        self.groupList = [];
        self.getGroupList();
        self.getGroupCount();
    }

    loadMore(event: any) {
        const self = this;
        if (event.target.scrollTop + event.target.offsetHeight === event.target.scrollHeight
            && self.totalRecords - 1 !== self.groupList.length) {
            self.apiConfig.page = self.apiConfig.page + 1;
            self.showLazyLoader = true;
            self.getGroupList();
        }
    }
    addNewGroup() {
        const self = this;
        self.newGroupModalRef = self.commonService.modal(self.newGroupModal);
        self.newGroupModalRef.result.then(close => {
            if (close && self.form.valid) {
                self.createGroup();
            }
        }, dismiss => { });
    }
    createGroup() {
        const self = this;
        const payload = self.form.value;
        payload.app = self.commonService.app._id;
        self.showLazyLoader = true;
        self.subscriptions['createGroup'] = self.commonService.post('user', `/${this.commonService.app._id}/group/`, payload).subscribe(res => {
            self.newGroup = {};
            self.showLazyLoader = false;
            self.newGroupModalRef.close();
            self.router.navigate(['/app', self.commonService.app._id, 'cp', 'gm', res._id]);
        }, err => {
            self.showLazyLoader = false;
            self.commonService.errorToast(err);
        });
    }

    hasPermission(type: string) {
        const self = this;
        return self.commonService.hasPermission(type);
    }
}
