import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import * as _ from 'lodash';

import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonFilterPipe } from 'src/app/utils/pipes/common-filter/common-filter.pipe';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';

@Component({
    selector: 'odp-agents',
    templateUrl: './agents.component.html',
    styleUrls: ['./agents.component.scss'],
    providers: [CommonFilterPipe]
})
export class AgentsComponent implements OnInit, OnDestroy {

    agentData: any;
    subscriptions: any;
    selectedAgent: any;
    showLazyLoader: boolean;
    agentList: Array<any>;
    showNewAgentWindow: boolean;
    searchTerm: string;
    showOptionsDropdown: any;
    selectedItemEvent: any;
    sortModel: any;
    alertModal: {
        statusChange?: boolean;
        title: string;
        message: string;
        index: number;
    };
    breadcrumbPaths: Array<Breadcrumb>;
    openDeleteModal: EventEmitter<any>;
    constructor(
        public commonService: CommonService,
        private appService: AppService,
        private commonPipe: CommonFilterPipe,
        private router: Router,
        private ts: ToastrService
    ) {
        this.agentData = {};
        this.subscriptions = {};
        this.agentList = [];
        this.alertModal = {
            statusChange: false,
            title: '',
            message: '',
            index: -1
        };
        this.breadcrumbPaths = [{
            active: true,
            label: 'Agents'
        }];
        this.showOptionsDropdown = {};
        this.commonService.changeBreadcrumb(this.breadcrumbPaths)
        this.openDeleteModal = new EventEmitter();
        this.sortModel = {};
    }

    ngOnInit() {
        this.getAgentList();
    }

    ngOnDestroy() {
        Object.keys(this.subscriptions).forEach(key => {
            if (this.subscriptions[key]) {
                this.subscriptions[key].unsubscribe();
            }
        });
    }

    getAgentList() {
        return this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent/utils/count`).pipe(switchMap(count => {
            return this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent`, { count: count })
        })).subscribe(res => {
            this.agentList = res;
        }, err => {
            this.commonService.errorToast(err);
        });
    }


    newAgent() {
        this.agentData = {
            app: this.commonService.app._id,
            type: 'APPAGENT',
            encryptFile: true,
            retainFileOnSuccess: true,
            retainFileOnError: true
        };
        this.showNewAgentWindow = true;
    }

    triggerAgentCreate() {
        if (!this.agentData.name) {
            return;
        }
        delete this.agentData.isEdit;
        this.showNewAgentWindow = false;
        this.showLazyLoader = true;
        this.commonService.post('partnerManager', `/${this.commonService.app._id}/agent`, this.agentData).subscribe(res => {
            this.showLazyLoader = false;
            this.getAgentList();
        }, err => {
            this.showLazyLoader = false;
            this.commonService.errorToast(err);
        });
    }

    editAgent(_index) {
        this.appService.editLibraryId = this.agentList[_index]._id;
        this.router.navigate(['/app/', this.app, 'agent', this.appService.editLibraryId]);
    }

    cloneAgent(_index) {
        this.appService.cloneLibraryId = this.agentList[_index]._id;
        this.router.navigate(['/app/', this.app, 'agent', this.appService.cloneLibraryId]);
    }

    deleteAgent(_index) {
        this.alertModal.statusChange = false;
        this.alertModal.title = 'Delete Agent';
        this.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
            + this.agentList[_index].name + '</span> Agent?';
        this.alertModal.index = _index;
        this.openDeleteModal.emit(this.alertModal);
    }

    closeDeleteModal(data) {
        if (data) {
            const url = `/${this.commonService.app._id}/agent/` + this.agentList[data.index]._id;
            this.showLazyLoader = true;
            this.subscriptions['deleteAgent'] = this.commonService.delete('partnerManager', url).subscribe(_d => {
                this.showLazyLoader = false;
                this.ts.info(_d.message ? _d.message : 'Agent deleted');
                this.getAgentList();
            }, err => {
                this.showLazyLoader = false;
                this.commonService.errorToast(err, 'Unable to delete, please try again later');
            });
        }
    }

    toCapitalize(text: string) {
        return text ? this.appService.toCapitalize(text) : null;
    }

    hasManagePermission(entity: string) {
        return this.commonService.hasPermission('PMA', entity);
    }

    hasViewPermission(entity: string) {
        return this.commonService.hasPermission('PVA', entity);
    }

    hasPermissionForAgent(id: string) {
        if (
            this.commonService.isAppAdmin ||
            this.commonService.userDetails.isSuperAdmin
        ) {
            return true;
        } else {
            if (
                this.commonService.hasPermissionStartsWith('PMA', 'AGENT') ||
                this.commonService.hasPermissionStartsWith('PVA', 'AGENT')
            ) {
                return true;
            } else {
                return false;
            }
        }
    }
    canEditAgent(id: string) {
        if (
            this.commonService.isAppAdmin ||
            this.commonService.userDetails.isSuperAdmin
        ) {
            return true;
        } else {
            const list2 = this.commonService.getEntityPermissions('AGENT');
            return Boolean(
                list2.find((e: any) => e.id.startsWith('PMA'))
            );
        }
    }

    applySort(field: string) {
        if (!this.sortModel[field]) {
            this.sortModel = {};
            this.sortModel[field] = 1;
        } else if (this.sortModel[field] == 1) {
            this.sortModel[field] = -1;
        } else {
            delete this.sortModel[field];
        }
    }
    getStatusClass(srvc: any) {
        if (srvc.status === 'Active') {
            return 'text-success';
        }
        if (srvc.status === 'Stopped' || srvc.status === 'Undeployed') {
            return 'text-danger';
        }
        if (srvc.status === 'Draft') {
            return 'text-accent';
        }
        if (srvc.status === 'Pending') {
            return 'text-warning';
        }
        return 'text-secondary';
    }

    getStatusLabel(srvc: any) {
        if (srvc.status === 'Active') {
            return 'Running';
        }
        if (srvc.status === 'Stopped' || srvc.status === 'Undeployed') {
            return 'Stopped';
        }
        if (srvc.status === 'Draft') {
            return 'Draft';
        }
        if (srvc.status === 'Pending') {
            return 'Pending';
        }
        return 'Maintainance';
    }

    showDropDown(event: any, id: string) {
        this.selectedItemEvent = event;
        Object.keys(this.showOptionsDropdown).forEach(key => {
            this.showOptionsDropdown[key] = false;
        })
        this.selectedAgent = this.agentList.find(e => e._id == id);
        this.showOptionsDropdown[id] = true;
    }

    private compare(a: any, b: any) {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        } else {
            return 0;
        }
    }

    get dropDownStyle() {
        let top = (this.selectedItemEvent.clientY + 10);
        if (this.selectedItemEvent.clientY > 430) {
            top = this.selectedItemEvent.clientY - 170
        }
        return {
            top: top + 'px',
            right: '50px'
        };
    }

    get records() {
        let records = this.commonPipe.transform(this.agentList, 'name', this.searchTerm);
        const field = Object.keys(this.sortModel)[0];
        if (field) {
            records = records.sort((a, b) => {
                if (this.sortModel[field] == 1) {
                    if (typeof a[field] == 'number' || typeof b[field] == 'number') {
                        return this.compare((a[field]), (b[field]));
                    } else {
                        return this.compare(_.lowerCase(a[field]), _.lowerCase(b[field]));
                    }
                } else if (this.sortModel[field] == -1) {
                    if (typeof a[field] == 'number' || typeof b[field] == 'number') {
                        return this.compare((b[field]), (a[field]));
                    } else {
                        return this.compare(_.lowerCase(b[field]), _.lowerCase(a[field]));
                    }
                } else {
                    return 0;
                }
            });
        } else {
            records = records.sort((a, b) => {
                return this.compare(b._metadata.lastUpdated, a._metadata.lastUpdated);
            });
        }
        return records;
    }

    get isAppAdmin() {
        return this.commonService.isAppAdmin;
    }

    get isSuperAdmin() {
        return this.commonService.userDetails.isSuperAdmin;
    }

    get isExperimental() {
        return this.commonService.userDetails.experimentalFeatures;
    }

    get app() {
        return this.commonService.app._id;
    }
}
