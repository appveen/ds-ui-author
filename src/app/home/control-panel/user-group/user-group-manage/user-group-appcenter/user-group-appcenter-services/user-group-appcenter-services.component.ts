import { Component, OnInit, Input } from '@angular/core';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
    selector: 'odp-user-group-appcenter-services',
    templateUrl: './user-group-appcenter-services.component.html',
    styleUrls: ['./user-group-appcenter-services.component.scss']
})
export class UserGroupAppcenterServicesComponent implements OnInit {
    @Input() roles: Array<any>;
    @Input() users: Array<string>;
    serviceList: Array<any>;
    toggleAccordion: any;
    subscriptions: any;
    activeSubTab: number;
    showLazyLoader: boolean;
    selectedDS: any;
    adminRole: boolean;

    constructor(private commonService: CommonService,
        private appService: AppService) {
        const self = this;
        self.serviceList = [];
        self.toggleAccordion = {};
        self.subscriptions = {};
        self.roles = [];
        self.activeSubTab = 0;
        self.showLazyLoader = false;
        self.selectedDS = {};
        self.adminRole = false;
    }

    ngOnInit() {
        const self = this;
        self.getServiceList();
    }

    getServiceList() {
        const self = this;
        self.showLazyLoader = true;

        const options: GetOptions = {
            count: -1,
            select: 'role,workflowConfig,name',
            filter: {
                app: self.commonService.app._id
            }
        };
        self.subscriptions['getServiceList'] = self.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, options).subscribe(res => {
            self.serviceList = res.filter(data => !!data.role).map(data => {
                data.role.workflowConfig = data.workflowConfig;
                data.role.name = data.name;
                data.role._id = data._id
                return data.role;
            });
            if (self.serviceList.length > 0) {
                self.selectDataService(self.serviceList[0]);
            }
            self.showLazyLoader = false;
        }, err => {
            self.showLazyLoader = false;
            self.commonService.errorToast(err, 'Unable to fetch services, please try again later');
        });
    }

    selectDataService(srvc) {
        const self = this;
        self.selectedDS = srvc;
        self.adminRole = self.roles.filter(r => r.id == 'ADMIN_' + self.selectedDS._id).length == 1;
    }

    hasManage(role: any) {
        if (role.operations.find(e => e.method === 'POST'
            || e.method === 'PUT'
            || e.method === 'DELETE'
            || e.method === 'SKIP_REVIEW'
            || e.method === 'REVIEW')) {
            return true;
        }
        return false;
    }

    hasMethod(role: any, method: string) {
        if (method === 'RULE' && role.enableFilter) {
            return true;
        }
        if (role.operations.find(e => e.method === method)) {
            return true;
        }
        return false;
    }

    get totalActiveRoles() {
        const self = this;
        let selectedDsRoleIds = self.roles.filter(r => r.type === 'appcenter').map(r => r.id);
        return self.selectedDS.roles.filter(r => selectedDsRoleIds.includes(r.id)).length;
    }

    roleActive(role: any) {
        const self = this;
        if (self.roles.find(r => r.id === role.id && r.entity === self.selectedDS._id)) {
            return true;
        }
        return false;
    }

    toggleRole(flag: boolean, role: any, service: any) {
        const self = this;
        if (flag) {
            self.roles.push({
                id: role.id,
                entity: self.selectedDS._id,
                app: self.commonService.app._id,
                type: 'appcenter'
            });
        } else {
            const index = self.roles.findIndex(r => r.id === role.id && r.entity === self.selectedDS._id);
            self.roles.splice(index, 1);
        }
    }

    toggleAdmin(val) {
        const self = this;
        if (val) {
            self.roles.push({
                id: 'ADMIN_' + self.selectedDS._id,
                entity: self.selectedDS._id,
                app: self.commonService.app._id,
                type: 'appcenter'
            });
        } else {
            const index = self.roles.findIndex(r => r.id === 'ADMIN_' + self.selectedDS._id && r.entity === self.selectedDS._id);
            if (index != -1) {
                self.roles.splice(index, 1);
            }
        }
    }

    collapseAccordion() {
        const self = this;
        Object.keys(self.toggleAccordion).forEach(key => {
            self.toggleAccordion[key] = false;
        });
    }

    hasPermission(type: string) {
        const self = this;
        return self.commonService.hasPermission(type);
    }

    get makerCheckerData() {
        const self = this;
        if (self.selectedDS.workflowConfig && self.selectedDS.workflowConfig.enabled && self.selectedDS.workflowConfig.makerCheckers.length > 0) {
            return self.selectedDS.workflowConfig.makerCheckers[0]
        } else {
            return null;
        }
    }

    get totalApprovals() {
        if (this.makerCheckerData) {
            return this.makerCheckerData.steps.reduce((prev, curr) => prev + curr.approvals, 0);
        } else {
            return 0;
        }
    }

}
