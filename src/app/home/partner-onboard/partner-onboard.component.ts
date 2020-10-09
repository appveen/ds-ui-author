import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/utils/services/common.service';
import { CanComponentDeactivate } from 'src/app/utils/guards/route.guard';
import { AppService } from 'src/app/utils/services/app.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'odp-partner-onboard',
    templateUrl: './partner-onboard.component.html',
    styleUrls: ['./partner-onboard.component.scss']
})
export class PartnerOnboardComponent implements OnInit, OnDestroy, CanComponentDeactivate {

    @ViewChild('downloadAgentModalTemplate', { static: false }) downloadAgentModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate: TemplateRef<HTMLElement>;
    activeTab: number;
    value: any;
    form: FormGroup;
    subscriptions: any;
    alertModal: {
        title: string;
        message: string;
    };
    toggleMicroflow: boolean;
    microflowId: string;
    downloadAgentModalTemplateRef: NgbModalRef;
    pageChangeModalTemplateRef: NgbModalRef;
    agentConfig: any;
    openDeleteModal: EventEmitter<any>;
    showLazyLoader: boolean;
    edit: any;
    constructor(private fb: FormBuilder,
        private commonService: CommonService,
        private appService: AppService,
        private router: Router,
        private route: ActivatedRoute,
        private ts: ToastrService) {
        const self = this;
        self.activeTab = -1;
        self.value = {};
        self.subscriptions = {};
        self.agentConfig = {};
        self.alertModal = {
            title: '',
            message: ''
        };
        self.edit = {
            status: false,
            id: null,
            editClicked: false
        };
        self.form = self.fb.group({
            _id: [],
            agentID: [],
            name: [null, [Validators.required,Validators.pattern('[a-zA-Z0-9\\s-_]+')]],
            app: [null, [Validators.required]],
            description: [null],
            logo: [null],
            secrets: [],
            flows: [],
            headers: [null],
            deletedSecrets: [],
            agentIPWhitelisting: self.fb.group({
                list: self.fb.array([]),
                enabled: [false]
            })
        });
        self.openDeleteModal = new EventEmitter();
    }

    ngOnInit() {
        const self = this;
        self.agentConfig.arch = 'amd64';
        self.agentConfig.os = 'windows';
        self.form.get('app').patchValue(self.commonService.app._id);
        self.route.params.subscribe(params => {
            if (params && params.id) {
                self.edit.id = params.id;
                if (self.appService.editServiceId) {
                    self.edit.editClicked = true;
                    self.appService.editServiceId = null;
                    self.edit.status = true;
                }
                self.agentConfig.partner = params.id;
                self.getPartner(params.id);
            } else {
                self.edit.status = true;
            }
        });
    }

    ngOnDestroy() {
        const self = this;
        if (self.downloadAgentModalTemplateRef) {
            self.downloadAgentModalTemplateRef.close(false);
        }
        Object.keys(self.subscriptions).forEach(key => {
            if (self.subscriptions[key]) {
                self.subscriptions[key].unsubscribe();
            }
        });
    }

    getPartner(id: string) {
        const self = this;
        self.showLazyLoader = true;
        self.subscriptions['getPartner'] = self.commonService.get('partnerManager', '/partner/' + id).subscribe(res => {
            self.showLazyLoader = false;
            self.value = res;
            if (res.agentIPWhitelisting && res.agentIPWhitelisting.list) {
                res.agentIPWhitelisting.list.forEach(item => {
                    (self.form.get('agentIPWhitelisting.list') as FormArray).push(self.appService.getIpFormControl(item));
                });
            }
            self.form.patchValue(res);
            self.setActiveTab();
        }, err => {
            self.showLazyLoader = false;
            self.ts.error(err.error.message);
        });
    }

    setActiveTab() {
        const self = this;
        if (self.hasPermissionForTab('F')) {
            self.activeTab = 0;
        } else if (self.hasPermissionForTab('P')) {
            self.activeTab = 2;
        } else if (self.hasPermissionForTab('H')) {
            self.activeTab = 3;
        } else if (self.hasPermissionForTab('M')) {
            self.activeTab = 4;
        }
    }

    deletePartner() {
        const self = this;
        self.alertModal.title = 'Delete ' + self.value.name + '?';
        self.alertModal.message = `Are you sure you want to delete this partner?
    This action will delete the integration flows and profiles for
    <span class="text-delete font-weight-bold">${self.value.name}</span>. It is highly
    recommended that you take a backup of your data before doing this, as the delete cannot be be undone.`;
        self.openDeleteModal.emit(self.alertModal);
    }

    closeDeleteModal(data) {
        const self = this;
        if (data) {
            self.showLazyLoader = true;
            self.subscriptions['deletePartner'] = self.commonService
                .delete('partnerManager', '/partner/' + self.value._id)
                .subscribe(res => {
                    self.showLazyLoader = false;
                    self.ts.success('Partner deleted successfully');
                    self.router.navigate(['/app', self.commonService.app._id, 'pm']);
                }, err => {
                    self.showLazyLoader = false;
                    self.ts.error(err.error.message);
                });
        }
    }

    changeLogo(event: Event) {
        const self = this;
        const size = (event.target as HTMLInputElement).files[0].size / 1024;
        if (Math.ceil(size) > 100) {
            self.ts.error('Please upload an image with size less then 100KB', null, { timeOut: 0 });
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL((event.target as HTMLInputElement).files[0]);
        reader.onload = () => {
            self.form.get('logo').patchValue(reader.result.toString());
        };
    }

    save(noRedirect?: boolean) {
        const self = this;
        const payload = self.form.value;
        payload.app = self.commonService.app._id;
        self.showLazyLoader = true;
        self.preSaveHook(payload).then(newPayload => {
            let request: Observable<any>;
            if (!self.canEditPartner) {
                delete newPayload.logo;
                delete newPayload.name;
                delete newPayload.description;
            }
            if (!self.hasPermissionForTab('F')) {
                delete newPayload.flows;
            }
            if (!self.hasPermissionForTab('H')) {
                delete newPayload.headers;
                delete newPayload.agentIPWhitelisting;
                delete newPayload.agentID;
            }
           
            if (!self.hasPermissionForTab('P')) {
                delete newPayload.secrets;
            }
            if (self.value && self.value._id) {
                delete newPayload._id;
                request = self.commonService.put('partnerManager', '/partner/' + self.value._id, newPayload);
            } else {
                request = self.commonService.post('partnerManager', '/partner', newPayload);
            }
            self.subscriptions['savePartner'] = request.subscribe(res => {
                self.showLazyLoader = false;
                self.form.markAsPristine();
                if (!noRedirect) {
                    self.router.navigate(['/app', self.commonService.app._id, 'pm']);
                }
                self.ts.success('Partner saved successfully');
            }, err => {
                self.showLazyLoader = false;
                self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
            });
        }, err => {
            self.showLazyLoader = false;
            self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
        });
    }

    preSaveHook(payload: any): Promise<any> {
        const self = this;
        const arr1 = [];
        const arr2 = [];
        if (!self.hasPermissionForTab('P')) {
            delete payload.deletedSecrets;
            return new Promise((resolve, reject) => {
                resolve(payload);
            });
        }
        return new Promise((resolve, reject) => {
            if (payload.deletedSecrets && payload.deletedSecrets.length > 0) {
                payload.deletedSecrets.forEach(item => {
                    arr1.push(self.commonService.delete('sec', `/pm/${self.value._id}/secret/${item.secretId}`).toPromise());
                });
            }
            let temp;
            if (payload.secrets && payload.secrets.length > 0) {
                temp = payload.secrets.filter(e => !e.secretId);
                temp.forEach(item => {
                    if (!item.secretId) {
                        const data = self.appService.cloneObject(item.value);
                        Object.keys(data).forEach(key => {
                            if (!data[key]) {
                                delete data[key];
                            }
                        });
                        arr2.push(self.commonService.post('sec', `/pm/${self.value._id}/secret/enc`, {
                            app: self.commonService.app._id,
                            data: JSON.stringify(data)
                        }).toPromise());
                    }
                });
            }
            Promise.all(arr2).then(res1 => {
                delete payload.deletedSecrets;
                if (temp && temp.length > 0) {
                    temp.forEach((item, i) => {
                        if (!item.secretId) {
                            item.secretId = res1[i].id;
                            delete item.value;
                        }
                        const tempIndex = payload.secrets.findIndex(e => e.name === item.name);
                        payload.secrets.splice(tempIndex, 1);
                    });
                    payload.secrets = payload.secrets.concat(temp);
                }
                Promise.all(arr1).then(res2 => {
                    resolve(payload);
                }, err => {
                    reject(err);
                });
            }, err => {
                reject(err);
            });
        });
    }

    canDeactivate(): Promise<any> | boolean {
        const self = this;
        if (self.form.dirty) {
            return new Promise((resolve, reject) => {
                self.pageChangeModalTemplateRef = self.commonService.modal(self.pageChangeModalTemplate);
                self.pageChangeModalTemplateRef.result.then(close => {
                    resolve(close);
                }, dismiss => {
                    resolve(false);
                });
            });
        }
        return true;
    }

    openMicroflow(id?: string) {
        const self = this;
        self.toggleMicroflow = true;
        self.microflowId = id;
    }

    downloadPartnerAgent() {
        const self = this;
        self.downloadAgentModalTemplateRef = self.commonService.modal(self.downloadAgentModalTemplate);
        self.downloadAgentModalTemplateRef.result.then(close => {
            if (close) {
                self.triggerPartnerAgentDownload(close);
            }
        }, dismiss => { });
    }

    triggerPartnerAgentDownload(os: string) {
        const self = this;
        const ele: HTMLAnchorElement = document.createElement('a');
        ele.target = '_blank';
        const queryParams = `${self.commonService.app._id}/download/partneragent?` +
            `os=${os}&partner=${self.agentConfig.partner}&arch=${self.agentConfig.arch}`;
        if (environment.production) {
            ele.href = `${environment.url.partnerManager}/${queryParams}`;
        } else {
            ele.href = `http://localhost/api/a/pm/${queryParams}`;
        }
        ele.click();
        ele.remove();
    }

    cancel() {
        const self = this;
        if (self.form.dirty) {
            self.pageChangeModalTemplateRef = self.commonService.modal(self.pageChangeModalTemplate);
        } else {
            self.router.navigate(['/app', self.commonService.app._id, 'pm']);
            return;
        }
        self.pageChangeModalTemplateRef.result.then(close => {
            if (close) {
                self.form.markAsPristine();
                self.router.navigate(['/app', self.commonService.app._id, 'pm']);
            }
        }, dismiss => { });
    }
    enableEdit() {
        const self = this;
        self.edit.status = true;
        self.setActiveTab();
    }

    hasPermission(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermission(type, entity);
    }

    hasPermissionStartsWith(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermissionStartsWith(type, entity);
    }

    hasPermissionForTab(type: string) {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        }
        if (Object.values(self.value).length === 0) {
            return;
        }
        const list = self.commonService.getEntityPermissions('PM_' + self.value._id);
        let inAllPermission = false;
        let inListPermission = false;
        if (self.edit.status) {
            inAllPermission = self.hasPermissionStartsWith('PMP' + type);
            inListPermission = Boolean(list.find(e => e.id.substr(0, 4) === 'PMP' + type));
        } else {
            inAllPermission = self.hasPermissionStartsWith('PMP' + type)
                || self.hasPermissionStartsWith('PVP' + type);
            inListPermission = Boolean(list.find(e => e.id.substr(0, 4) === 'PMP' + type))
                || Boolean(list.find(e => e.id.substr(0, 4) === 'PVP' + type));
        }
        if (list.length === 0 && inAllPermission) {
            return true;
        } else {
            return list.length > 0 && inListPermission;
        }

       
    }

    get canEditPartner() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        }
        const list = self.commonService.getEntityPermissions('PM_' + self.value._id);
        if (list.length === 0 && self.commonService.hasPermission('PMPBU')) {
            return true;
        } else if (list.length > 0 && list.find(e => e.id === 'PMPBU')) {
            return true;
        } else {
            return false;
        }
    }

    get hasWritePermission() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        }
        const list = self.commonService.getEntityPermissions('PM_' + self.value._id);
        if (list.length === 0 && self.commonService.hasPermissionStartsWith('PMP')) {
            return true;
        } else if (list.length > 0 && list.find(e => e.id.substr(0, 3) === 'PMP')) {
            return true;
        } else {
            return false;
        }
    }

    get logo() {
        const self = this;
        if (self.form && self.form.get('logo')) {
            return self.form.get('logo').value;
        }
        return null;
    }

    set logo(val) {
        const self = this;
        if (self.form && self.form.get('logo')) {
            self.form.get('logo').patchValue(val);
            self.form.get('logo').markAsDirty();
        }
    }

    get name() {
        const self = this;
        if (self.form && self.form.get('name')) {
            return self.form.get('name').value;
        }
        return null;
    }

    set name(val) {
        const self = this;
        if (self.form && self.form.get('name')) {
            self.form.get('name').patchValue(val);
            self.form.get('name').markAsDirty();
        }
    }

    get description() {
        const self = this;
        if (self.form && self.form.get('description')) {
            return self.form.get('description').value;
        }
        return null;
    }

    set description(val) {
        const self = this;
        if (self.form && self.form.get('description')) {
            self.form.get('description').patchValue(val);
            self.form.get('description').markAsDirty();
        }
    }

    get partnerLogo() {
        const self = this;
        if (self.form && self.form.get('logo')) {
            return self.form.get('logo').value;
        }
        return null;
    }
}
