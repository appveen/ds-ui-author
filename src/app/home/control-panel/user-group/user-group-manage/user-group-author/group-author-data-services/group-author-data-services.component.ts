import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
    selector: 'odp-group-author-data-services',
    templateUrl: './group-author-data-services.component.html',
    styleUrls: ['./group-author-data-services.component.scss']
})
export class GroupAuthorDataServicesComponent implements OnInit, OnDestroy {

    @Input() roles: Array<any>;
    @Output() rolesChange: EventEmitter<Array<any>>;
    @ViewChild('exceptionListModal', { static: false }) exceptionListModal: TemplateRef<HTMLElement>;
    dropdownToggle: {
        [key: string]: boolean
    };
    exceptionList: Array<any>;
    toggleDropdown: any;
    subscriptions: any;
    searchTerm: string;
    dataServiceTabs: Array<{ type: string; name: string }>;
    serviceList: Array<{ _id: string; name: string; hide?: boolean; selected?: boolean }>;
    exceptionListModalRef: NgbModalRef;
    managePermissionsArray: Array<string>;
    selectedException: any;
    dataHookList: Array<HookModule>;
    reviewHookList: Array<HookModule>;
    settingsTabList: Array<HookModule>;
    auditList: Array<HookModule>;

    constructor(private commonService: CommonService,
        private appService: AppService) {
        const self = this;
        self.dropdownToggle = {};
        self.exceptionList = [];
        self.toggleDropdown = {};
        self.subscriptions = {};
        self.roles = [];
        self.rolesChange = new EventEmitter();
        self.dataServiceTabs = [
            {
                type: 'DS',
                name: 'All Tabs',
            },
            {
                type: 'DSD',
                name: 'Design',
            },
            {
                type: 'DSI',
                name: 'Integration'
            },
            {
                type: 'DSE',
                name: 'Experience'
            },
            {
                type: 'DSR',
                name: 'Roles'
            },
            {
                type: 'DSS',
                name: 'Settings'
            }
        ];
        self.dataHookList = [
            {
                label: 'Pre Hooks',
                segment: 'DSIDPR',
                entity: 'SM'
            },
            {
                label: 'Post Hooks',
                segment: 'DSIDPO',
                entity: 'SM'
            }
        ];
        self.reviewHookList = [
            {
                label: 'Submit Hooks',
                segment: 'DSIRSU',
                entity: 'SM'
            },
            {
                label: 'Approve Hooks',
                segment: 'DSIRAP',
                entity: 'SM'
            },
            {
                label: 'Reject Hooks',
                segment: 'DSIRRJ',
                entity: 'SM'
            },
            {
                label: 'Discard Hooks',
                segment: 'DSIRDI',
                entity: 'SM'
            },
            {
                label: 'Review Hooks',
                segment: 'DSIRRW',
                entity: 'SM'
            }

        ];
        self.settingsTabList = [
            {
                label: 'Data History',
                segment: 'DSSDH',
                entity: 'SM'
            },
            {
                label: 'Permanent Delete',
                segment: 'DSSPD',
                entity: 'SM'
            },
            {
                label: 'Reset Setting',
                segment: 'DSSRE',
                entity: 'SM'
            },
            {
                label: 'End Point Setting',
                segment: 'DSSEP',
                entity: 'SM'
            },
            {
                label: 'Fuzzy Search Setting',
                segment: 'DSSFS',
                entity: 'SM'
            },
            {
                label: 'Property Setting',
                segment: 'DSSPR',
                entity: 'SM'
            }
        ];
        self.auditList = [    
            {
                label: 'Service',
                segment: 'DSASR',
                entity: 'SM'
            },
        ];
    }

    get showException() {
        const self = this;
        return self.serviceList && self.serviceList.length > 0;
    }

   
    get checkAll() {
        const self = this;
        if (self.serviceList.length === 0) {
            return false;
        }
        const temp = self.serviceList.filter(e => !e.hide);
        if (temp.length === 0) {
            return false;
        }
        return Math.min.apply(null, temp.map(e => e.selected));
    }

    set checkAll(val: any) {
        const self = this;
        self.serviceList.forEach(e => {
            e.selected = val;
        });
    }

    get basicPermission() {
        const self = this;
        const viewIndex = self.roles.findIndex(r => r.id === 'PVDSB' && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        const manageIndex = self.roles.findIndex(r => (r.id === 'PMDSBC' || r.id === 'PMDSBU' || r.id === 'PMDSBD') && r.entity ===
            ('SM' + (self.selectedException ?
                ('_' + self.selectedException._id) : '')));
        if (manageIndex > -1) {
            return 'manage';
        }
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    set basicPermission(val: any) {
        const self = this;
        const blockedIndex = self.roles.findIndex(r => r.id === 'PNDSB' && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (blockedIndex > -1) {
            self.roles.splice(blockedIndex, 1);
        }
        const viewIndex = self.roles.findIndex(r => r.id === 'PVDSB' && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (viewIndex > -1) {
            self.roles.splice(viewIndex, 1);
        }
        const createIndex = self.roles.findIndex(r => r.id === 'PMDSBC' && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (createIndex > -1) {
            self.roles.splice(createIndex, 1);
        }
        const editIndex = self.roles.findIndex(r => r.id === 'PMDSBU' && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (editIndex > -1) {
            self.roles.splice(editIndex, 1);
        }
        const deleteIndex = self.roles.findIndex(r => r.id === 'PMDSBD' && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (deleteIndex > -1) {
            self.roles.splice(deleteIndex, 1);
        }
        if (Array.isArray(val)) {
            val.forEach(item => {
                self.roles.push(self.getPermissionObject(item, self.selectedException));
            });
        } else {
            self.roles.push(self.getPermissionObject(val, self.selectedException));
            if (val === 'PNDSB') {
                self.commonPermission = { id: 'PNDSD', type: 'D' };
                self.commonPermission = { id: 'PNDSPD', type: 'PD' };
                self.commonPermission = { id: 'PNDSPS', type: 'PS' };
                self.commonPermission = { id: 'PNDSE', type: 'E' };
                self.commonPermission = { id: 'PNDSR', type: 'R' };
                self.dataHookList.forEach(item => {
                    self.changeHookPermissionLevel('N', item.segment, item.entity);
                });
                self.reviewHookList.forEach(item => {
                    self.changeHookPermissionLevel('N', item.segment, item.entity);
                });
                self.auditList.forEach(item => {
                    self.changeHookPermissionLevel('N', item.segment, item.entity);
                });
                self.settingsTabList.forEach(item => {
                    self.changeHookPermissionLevel('N', item.segment, item.entity);
                });
            }
        }

    }

    get powerPermissionDeploy() {
        const self = this;
        const manageIndex = self.roles.findIndex(r => (
            r.id === 'PMDSPD') && r.entity === ('SM' + (self.selectedException ?
                ('_' + self.selectedException._id) : '')));
        if (manageIndex > -1) {
            return 'manage';
        }
        return 'blocked';
    }

    get powerPermissionsStartStop() {
        const self = this;
        const manageIndex = self.roles.findIndex(r => (
            r.id === 'PMDSPS') && r.entity === ('SM' + (self.selectedException ?
                ('_' + self.selectedException._id) : '')));
        if (manageIndex > -1) {
            return 'manage';
        }
        return 'blocked';
    }

    get definitionPermission() {
        const self = this;
        const viewIndex = self.roles.findIndex(r => (
            r.id === 'PVDSD') && r.entity === ('SM' + (self.selectedException ?
                ('_' + self.selectedException._id) : '')));
        const manageIndex = self.roles.findIndex(r => (
            r.id === 'PMDSD') && r.entity === ('SM' + (self.selectedException ?
                ('_' + self.selectedException._id) : '')));
        if (manageIndex > -1) {
            return 'manage';
        }
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    get experiencePermission() {
        const self = this;
        const viewIndex = self.roles.findIndex(r => (
            r.id === 'PVDSE') && r.entity === ('SM' + (self.selectedException ?
                ('_' + self.selectedException._id) : '')));
        const manageIndex = self.roles.findIndex(r => (
            r.id === 'PMDSE') && r.entity === ('SM' + (self.selectedException ?
                ('_' + self.selectedException._id) : '')));
        if (manageIndex > -1) {
            return 'manage';
        }
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    get rolePermission() {
        const self = this;
        const viewIndex = self.roles.findIndex(r => (
            r.id === 'PVDSR') && r.entity === ('SM' + (self.selectedException ?
                ('_' + self.selectedException._id) : '')));
        const manageIndex = self.roles.findIndex(r => (
            r.id === 'PMDSR') && r.entity === ('SM' + (self.selectedException ?
                ('_' + self.selectedException._id) : '')));
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
        const self = this;
        const blockedIndex = self.roles.findIndex(r => r.id === 'PNDS' + val.type && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (blockedIndex > -1) {
            self.roles.splice(blockedIndex, 1);
        }
        const manageIndex = self.roles.findIndex(r => r.id === 'PMDS' + val.type && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (manageIndex > -1) {
            self.roles.splice(manageIndex, 1);
        }
        const viewIndex = self.roles.findIndex(r => r.id === 'PVDS' + val.type && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (viewIndex > -1) {
            self.roles.splice(viewIndex, 1);
        }
        if ((val.id.substring(0, 2) === 'PV' || val.id.substring(0, 2) === 'PM') && self.basicPermission === 'blocked') {
            self.basicPermission = 'PVDSB';
        }
        self.roles.push(self.getPermissionObject(val.id, self.selectedException));
    }


    // new design functions

    get createPermission() {
        const self = this;
        const manageIndex = self.roles.findIndex(r => r.id === 'PMDSBC' && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (manageIndex > -1) {
            return true;
        }
        return false;
    }

    get editPermission() {
        const self = this;
        const manageIndex = self.roles.findIndex(r => r.id === 'PMDSBU' && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (manageIndex > -1) {
            return true;
        }
        return false;
    }

    get deletePermission() {
        const self = this;
        const manageIndex = self.roles.findIndex(r => r.id === 'PMDSBD' && r.entity === ('SM' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
        if (manageIndex > -1) {
            return true;
        }
        return false;
    }

    ngOnInit() {
        const self = this;
        if (!self.roles) {
            self.roles = [];
        }
        const temp = self.roles.filter(r => r.entity.indexOf('SM_') > -1)
            .map(item => item.entity.split('_')[1])
            .filter((e, i, a) => a.indexOf(e) === i);
        self.exceptionList = temp.map(item => {
            const obj: any = {};
            obj._id = item;
            return obj;
        });
        self.getServiceList();

    }

    getServiceList() {
        const self = this;
        const options: GetOptions = {
            select: 'name,attributeCount',
            count: -1,
            filter: {
                app: self.commonService.app._id,
            }
        };
        self.subscriptions['serviceList'] = self.commonService.get('serviceManager', '/service', options).subscribe(res => {
            self.serviceList = res.filter(e => e);
            self.exceptionList.forEach(item => {
                const temp = self.serviceList.find(e => e._id === item._id);
                if (temp) {
                    temp.hide = true;
                    item.name = temp.name;
                } else {
                    item.name = 'ERROR';
                }
            });
        });
    }

    openExceptionModal() {
        const self = this;
        self.exceptionListModalRef = self.commonService.modal(self.exceptionListModal, {
            centered: true,
            windowClass: 'service-exception-modal'
        });
        self.exceptionListModalRef.result.then(close => {
            if (close) {
                const temp = self.serviceList.filter(s => !s.hide && s.selected);
                if (temp && temp.length > 0) {
                    temp.forEach(item => {
                        item.hide = true;
                        self.exceptionList.push(item);
                        let globalPermissions = [];
                        globalPermissions = self.appService
                            .cloneObject(self.roles.filter(e => e.entity === ('SM' + (self.selectedException ?
                                ('_' + self.selectedException._id) : ''))));
                        globalPermissions.forEach(itm => {
                            itm['entity'] = 'SM_' + item._id;
                            self.roles.push(itm);
                        });
                        self.selectedException = item;
                    });
                }
            }
            self.checkAll = false;
        }, dismiss => {
            self.checkAll = false;
        });
    }

    removeException(service: any) {
        const self = this;
        const index = self.exceptionList.findIndex(i => i._id === service._id);
        if (index > -1) {
            self.exceptionList.splice(index, 1);
            self.roles = self.roles.filter(r => r.entity.indexOf(service._id) === -1);
            const temp = self.serviceList.find(s => s._id === service._id);
            temp.hide = false;
            self.rolesChange.emit(self.roles);
        }
        if (!self.exceptionList.length) {
            self.selectedException = null;
        }
    }

    removeRoleAtIndex(index: number) {
        const self = this;
        if (index > -1) {
            self.roles.splice(index, 1);
        }
    }

    getPermissionObject(id: string, service: any) {
        const self = this;
        return {
            id: id,
            app: self.commonService.app._id,
            entity: 'SM' + (service ? '_' + service._id : ''),
            type: 'author'
        };
    }

    hasPermission(type: string) {
        const self = this;
        return self.commonService.hasPermission(type);
    }

    ngOnDestroy() {
        const self = this;
        if (self.exceptionListModalRef) {
            self.exceptionListModalRef.close();
        }
    }

    getHookPermissionLevel(segment: string, entity: string) {
        const self = this;
        const viewIndex = self.roles.findIndex(r => r.id === 'PV' + segment
            && r.entity === entity + (self.selectedException ? '_' + self.selectedException._id : ''));
        const manageIndex = self.roles.findIndex(r => r.id === 'PM' + segment && r.entity === entity +
            (self.selectedException ? '_' + self.selectedException._id : ''));
        if (manageIndex > -1) {
            return 'manage';
        }
        if (viewIndex > -1) {
            return 'view';
        }
        return 'blocked';
    }

    changeHookPermissionLevel(level: string, segment: string, entity: string) {
        const self = this;
        // if (!self.hasPermission('PMGAG')) {
        //   return;
        // }
        if (level === 'V' && segment === 'DSSR') {
            return;
        }
        const blockedIndex = self.roles.findIndex(r => r.id === 'PN' + segment && r.entity === entity +
            (self.selectedException ? '_' + self.selectedException._id : ''));
        if (blockedIndex > -1) {
            self.roles.splice(blockedIndex, 1);
        }
        const viewIndex = self.roles.findIndex(r => r.id === 'PV' + segment && r.entity === entity +
            (self.selectedException ? '_' + self.selectedException._id : ''));
        if (viewIndex > -1) {
            self.roles.splice(viewIndex, 1);
        }
        const manageIndex = self.roles.findIndex(r => r.id === 'PM' + segment && r.entity === entity +
            (self.selectedException ? '_' + self.selectedException._id : ''));
        if (manageIndex > -1) {
            self.roles.splice(manageIndex, 1);
        }
        if ((level === 'V' || level === 'M') && self.basicPermission === 'blocked') {
            self.basicPermission = 'PVDSB';
        }
        self.roles.push(self.getPermissionObject('P' + level + segment, self.selectedException));
    }

    togglePermissionLevel(segment: string) {
        const self = this;
        if (!self.hasPermission('PMDS')) {
            return;
        }
        const blockedIndex = self.roles.findIndex(r => r.id === 'PMDS' + segment && r.entity === ('SM' +
            (self.selectedException ? ('_' + self.selectedException._id) : '')));
        if (blockedIndex > -1) {
            self.roles.splice(blockedIndex, 1);
        } else {
            self.roles.push(self.getPermissionObject('PMDS' + segment, self.selectedException));
        }
    }

}

export interface HookModule {
    label?: string;
    segment?: string;
    entity?: string;
}
