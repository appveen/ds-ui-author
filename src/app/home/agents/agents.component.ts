import { Component, OnInit, OnDestroy, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import * as _ from 'lodash';

import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonFilterPipe } from 'src/app/utils/pipes/common-filter/common-filter.pipe';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
    selector: 'odp-agents',
    templateUrl: './agents.component.html',
    styleUrls: ['./agents.component.scss'],
    providers: [CommonFilterPipe]
})
export class AgentsComponent implements OnInit, OnDestroy {

    @ViewChild('downloadAgentModal') downloadAgentModal: HTMLElement;
    downloadAgentModalRef: NgbModalRef;
    @ViewChild('agentDetailsModal') agentDetailsModal: HTMLElement;
    agentDetailsModalRef: NgbModalRef;
    @ViewChild('resetPasswordModel', { static: false }) resetPasswordModel: TemplateRef<HTMLElement>;
    resetPasswordModelRef: NgbModalRef;
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
    resetPasswordForm: FormGroup;
    showPassword: any;
    showPasswordSide: boolean = false;
    isClone: boolean=false;
    constructor(
        public commonService: CommonService,
        private appService: AppService,
        private commonPipe: CommonFilterPipe,
        private router: Router,
        private ts: ToastrService,
        private fb: FormBuilder,
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
        this.showPassword = {};
        this.resetPasswordForm = this.fb.group({
            password: [null],
            cpassword: [null, [Validators.required]],
        });
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


    newAgent(agent?, isEdit = false) {
        this.agentData = {
            app: this.commonService.app._id,
            type: 'APPAGENT',
            encryptFile: true,
            retainFileOnSuccess: true,
            retainFileOnError: true
        };
        if (agent) {
            if (isEdit) {
                this.agentData._id = agent._id
            }
            this.agentData.name = isEdit ? agent.name : agent.name + ' Copy',
                this.agentData.encryptFile = agent.encryptFile,
                this.agentData.retainFileOnSuccess = agent.retainFileOnSuccess,
                this.agentData.retainFileOnError = agent.retainFileOnError,
                this.agentData.isEdit = isEdit;
        }
        this.showNewAgentWindow = true;
    }

    triggerAgentCreate() {
        if (!this.agentData.name) {
            return;
        }
        const isEdit = this.agentData.isEdit;
        delete this.agentData.isEdit;
        this.showNewAgentWindow = false;
        this.showLazyLoader = true;
        if (isEdit) {
            this.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/` + this.agentData._id, this.agentData).subscribe(res => {
                if (res) {
                    this.ts.success('Agent Saved Sucessfully');
                    this.showNewAgentWindow = false;
                    this.showLazyLoader = false;
                    this.getAgentList();
                }

            }, err => {
                this.commonService.errorToast(err);
                this.showNewAgentWindow = false;
                this.showLazyLoader = false;
            });
        }
        else {
            this.commonService.post('partnerManager', `/${this.commonService.app._id}/agent`, this.agentData).subscribe(res => {
                this.showLazyLoader = false;
                if(this.isClone){
                    this.ts.success('Agent Cloned.')
                    this.isClone=false
                }else{
                    this.ts.success('Agent has been created.')
                }
                this.getAgentList();
            }, err => {
                this.showLazyLoader = false;
                this.commonService.errorToast(err);
            });
        }
    }

    cloneAgent(_index) {
        const cloneDetails = this.agentList[_index];
        this.isClone=true;
        this.newAgent(cloneDetails)
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
            this.subscriptions['deleteAgent'] = this.commonService.delete('partnerManager', `/${this.commonService.app._id}/agent/` + this.agentList[data.index]._id, this.agentList[data.index]).subscribe(res => {
                if (res) {
                    this.ts.success('Agent Deleted Sucessfully');
                    this.getAgentList();
                }

            }, err => {
                this.commonService.errorToast(err, 'Unable to delete, please try again later');
                this.showNewAgentWindow = false;
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
        return 'Maintenance';
    }

    showDropDown(event: any, id: string) {
        this.selectedItemEvent = event;
        Object.keys(this.showOptionsDropdown).forEach(key => {
            this.showOptionsDropdown[key] = false;
        })
        this.selectedAgent = this.agentList.find(e => e._id == id);
        this.showOptionsDropdown[id] = true;
    }

    openDownloadAgentWindow(agent: any) {
        this.downloadAgentModalRef = this.commonService.modal(this.downloadAgentModal, { size: 'lg' });
        this.downloadAgentModalRef.result.then(close => {
            if (close && typeof close == 'string') {
                const os = close.split('-')[0];
                const arch = close.split('-')[1];
                const url = environment.url.partnerManager + `/${this.commonService.app._id}/agent/utils/${agent._id}/download/exec?os=${os}&arch=${arch}`;
                window.open(url, '_blank');
            }
        }, dismiss => { });
    }

    openAgentDetailsWindow(agent: any) {
        this.agentData = agent;
        this.getAgentPassword(agent._id)
        this.agentDetailsModalRef = this.commonService.modal(this.agentDetailsModal, { size: 'md' });
        this.agentDetailsModalRef.result.then(close => { }, dismiss => { });
    }

    navigate(agent) {
        this.router.navigate(['/app/', this.app, 'agent', agent._id])
    }

    copyPassword(password) {
        const self = this;
        self.appService.copyToClipboard(password);
        self.ts.success('Password copied successfully');
    }


    getAgentPassword(id) {
        this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent/utils/${id}/password`
        ).subscribe(res => {
            this.agentData['thePassword'] = res?.password || ''
        }, err => {
            this.commonService.errorToast(err);
        });
    }

    resetPassword() {
        this.resetPasswordForm.get('password').markAsDirty();
        this.resetPasswordForm.get('cpassword').markAsDirty();
        const payload = {
            password: this.resetPasswordForm.get('password').value
        }
        if (this.resetPasswordForm.invalid) {
            return;
        } else {
            this.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/utils/${this.agentData._id}/password`, payload)
                .subscribe(() => {
                    this.resetPasswordForm.reset()
                    this.getAgentList();
                    this.ts.success('Password changed successfully');
                    this.showPassword = false
                    this.showPasswordSide = false
                }, err => {
                    this.resetPasswordForm.reset()
                    this.showPassword = false
                    this.showPasswordSide = false
                    this.commonService.errorToast(err, 'Unable to process request');
                });
        }
    }

    convertDate(dateString) {
        const date = new Date(dateString);
        return moment(date).format('DD-MMM\'YY, hh:mm:ss A')
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

    get matchPwd() {
        const self = this;
        return (
            self.resetPasswordForm.get('password').value !==
            self.resetPasswordForm.get('cpassword').value
        );
    }

    get pwdError() {
        const self = this;
        return (
            (self.resetPasswordForm.get('password').dirty &&
                self.resetPasswordForm.get('password').hasError('required')) ||
            (self.resetPasswordForm.get('password').dirty &&
                self.resetPasswordForm.get('password').hasError('minlength')) ||
            (self.resetPasswordForm.get('password').dirty &&
                self.resetPasswordForm.get('password').hasError('pattern'))
        );
    }

    get cPwdError() {
        const self = this;
        return (
            (self.resetPasswordForm.get('cpassword').dirty &&
                self.resetPasswordForm.get('cpassword').hasError('required')) ||
            (self.resetPasswordForm.get('cpassword').dirty && self.matchPwd)
        );
    }
}
