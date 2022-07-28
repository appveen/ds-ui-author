import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
    selector: 'odp-group-author-data-services',
    templateUrl: './group-author-data-services.component.html',
    styleUrls: ['./group-author-data-services.component.scss']
})
export class GroupAuthorDataServicesComponent implements OnInit, OnDestroy {

    @Input() roles: Array<any>;
    @Output() rolesChange: EventEmitter<Array<any>>;
    subscriptions: any;

    managePermissions: Array<string>;
    viewPermissions: Array<string>;

    constructor(private commonService: CommonService,
        private appService: AppService) {
        this.subscriptions = {};
        this.roles = [];
        this.rolesChange = new EventEmitter();
        this.managePermissions = ['PMDSBC', 'PMDSBU', 'PMDSBD', 'PMDSPD', 'PMDSPS', 'PMDSD', 'PMDSI', 'PMDSE', 'PMDSR', 'PMDSS', 'PVDSA'];
        this.viewPermissions = ['PVDSB', 'PVDSD', 'PVDSI', 'PVDSE', 'PVDSR', 'PVDSS', 'PVDSA'];
    }

    ngOnInit() {
        if (!this.roles) {
            this.roles = [];
        }
    }

    ngOnDestroy() {
    }

    getPermissionObject(id: string) {
        return {
            id: id,
            app: this.commonService.app._id,
            entity: 'SM',
            type: 'author'
        };
    }

    hasPermission(type: string) {
        return this.commonService.hasPermission(type);
    }

    togglePermissionLevel(segment: string) {
        if (!this.hasPermission('PMDS')) {
            return;
        }
        const blockedIndex = this.roles.findIndex(r => r.id === 'PMDS' + segment && r.entity === 'SM');
        if (blockedIndex > -1) {
            this.roles.splice(blockedIndex, 1);
        } else {
            this.roles.push(this.getPermissionObject('PMDS' + segment));
        }
    }

    changeAllPermissions(val: string) {
        if (val == 'manage') {
            this.roles.splice(0);
            this.managePermissions.forEach(item => {
                this.roles.push(this.getPermissionObject(item));
            });
        } else if (val == 'view') {
            this.roles.splice(0);
            this.viewPermissions.forEach(item => {
                this.roles.push(this.getPermissionObject(item));
            });
        } else if (val == 'blocked') {
            this.roles.splice(0);
        }
    }

    get basicPermission() {
        const viewIndex = this.roles.findIndex(r => r.id === 'PVDSB' && r.entity === 'SM');
        const manageIndex = this.roles.findIndex(r => (r.id === 'PMDSBC' || r.id === 'PMDSBU' || r.id === 'PMDSBD') && r.entity === 'SM');
        if (manageIndex > -1) {
            return 'manage';
        }
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    set basicPermission(val: any) {
        const blockedIndex = this.roles.findIndex(r => r.id === 'PNDSB' && r.entity === 'SM');
        if (blockedIndex > -1) {
            this.roles.splice(blockedIndex, 1);
        }
        const viewIndex = this.roles.findIndex(r => r.id === 'PVDSB' && r.entity === 'SM');
        if (viewIndex > -1) {
            this.roles.splice(viewIndex, 1);
        }
        const createIndex = this.roles.findIndex(r => r.id === 'PMDSBC' && r.entity === 'SM');
        if (createIndex > -1) {
            this.roles.splice(createIndex, 1);
        }
        const editIndex = this.roles.findIndex(r => r.id === 'PMDSBU' && r.entity === 'SM');
        if (editIndex > -1) {
            this.roles.splice(editIndex, 1);
        }
        const deleteIndex = this.roles.findIndex(r => r.id === 'PMDSBD' && r.entity === 'SM');
        if (deleteIndex > -1) {
            this.roles.splice(deleteIndex, 1);
        }
        if (Array.isArray(val)) {
            val.forEach(item => {
                this.roles.push(this.getPermissionObject(item));
            });
        } else {
            this.roles.push(this.getPermissionObject(val));
            if (val === 'PNDSB') {
                this.commonPermission = { id: 'PNDSD', type: 'D' };
                this.commonPermission = { id: 'PNDSPD', type: 'PD' };
                this.commonPermission = { id: 'PNDSPS', type: 'PS' };
                this.commonPermission = { id: 'PNDSE', type: 'E' };
                this.commonPermission = { id: 'PNDSR', type: 'R' };
                this.commonPermission = { id: 'PNDSI', type: 'I' };
                this.commonPermission = { id: 'PNDSA', type: 'A' };
                this.commonPermission = { id: 'PNDSS', type: 'S' };
            }
        }

    }

    get powerPermissionDeploy() {
        const manageIndex = this.roles.findIndex(r => (
            r.id === 'PMDSPD') && r.entity === 'SM');
        if (manageIndex > -1) {
            return 'manage';
        }
        return 'blocked';
    }

    get powerPermissionsStartStop() {
        const manageIndex = this.roles.findIndex(r => (
            r.id === 'PMDSPS') && r.entity === 'SM');
        if (manageIndex > -1) {
            return 'manage';
        }
        return 'blocked';
    }

    get definitionPermission() {
        const viewIndex = this.roles.findIndex(r => (
            r.id === 'PVDSD') && r.entity === 'SM');
        const manageIndex = this.roles.findIndex(r => (
            r.id === 'PMDSD') && r.entity === 'SM');
        if (manageIndex > -1) {
            return 'manage';
        }
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    get integrationPermission() {
        const viewIndex = this.roles.findIndex(r => (
            r.id === 'PVDSI') && r.entity === 'SM');
        const manageIndex = this.roles.findIndex(r => (
            r.id === 'PMDSI') && r.entity === 'SM');
        if (manageIndex > -1) {
            return 'manage';
        }
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    get settingsPermission() {
        const viewIndex = this.roles.findIndex(r => (
            r.id === 'PVDSS') && r.entity === 'SM');
        const manageIndex = this.roles.findIndex(r => (
            r.id === 'PMDSS') && r.entity === 'SM');
        if (manageIndex > -1) {
            return 'manage';
        }
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    get auditPermission() {
        const viewIndex = this.roles.findIndex(r => (
            r.id === 'PVDSA') && r.entity === 'SM');
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    get experiencePermission() {
        const viewIndex = this.roles.findIndex(r => (
            r.id === 'PVDSE') && r.entity === 'SM');
        const manageIndex = this.roles.findIndex(r => (
            r.id === 'PMDSE') && r.entity === 'SM');
        if (manageIndex > -1) {
            return 'manage';
        }
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    get rolePermission() {
        const viewIndex = this.roles.findIndex(r => (
            r.id === 'PVDSR') && r.entity === 'SM');
        const manageIndex = this.roles.findIndex(r => (
            r.id === 'PMDSR') && r.entity === 'SM');
        if (manageIndex > -1) {
            return 'manage';
        }
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    // Common setPermission for Power settings,Definition,Experience and Role
    set commonPermission(val: any) {
        const blockedIndex = this.roles.findIndex(r => r.id === 'PNDS' + val.type && r.entity === 'SM');
        if (blockedIndex > -1) {
            this.roles.splice(blockedIndex, 1);
        }
        const manageIndex = this.roles.findIndex(r => r.id === 'PMDS' + val.type && r.entity === 'SM');
        if (manageIndex > -1) {
            this.roles.splice(manageIndex, 1);
        }
        const viewIndex = this.roles.findIndex(r => r.id === 'PVDS' + val.type && r.entity === 'SM');
        if (viewIndex > -1) {
            this.roles.splice(viewIndex, 1);
        }
        if ((val.id.substring(0, 2) === 'PV' || val.id.substring(0, 2) === 'PM') && this.basicPermission === 'blocked') {
            this.basicPermission = 'PVDSB';
        }
        this.roles.push(this.getPermissionObject(val.id));
    }


    // new design functions

    get createPermission() {
        const manageIndex = this.roles.findIndex(r => r.id === 'PMDSBC' && r.entity === 'SM');
        if (manageIndex > -1) {
            return true;
        }
        return false;
    }

    get editPermission() {
        const manageIndex = this.roles.findIndex(r => r.id === 'PMDSBU' && r.entity === 'SM');
        if (manageIndex > -1) {
            return true;
        }
        return false;
    }

    get deletePermission() {
        const manageIndex = this.roles.findIndex(r => r.id === 'PMDSBD' && r.entity === 'SM');
        if (manageIndex > -1) {
            return true;
        }
        return false;
    }

    get globalPermission() {
        const perms = this.roles.map(e => e.id);
        if (_.intersection(this.managePermissions, perms).length === this.managePermissions.length) {
            return 'manage';
        } else if (_.intersection(this.viewPermissions, perms).length === this.viewPermissions.length) {
            return 'view';
        } else if (perms.length == 0) {
            return 'blocked';
        } else {
            return 'custom';
        }
    }

}

export interface HookModule {
    label?: string;
    segment?: string;
    entity?: string;
}
