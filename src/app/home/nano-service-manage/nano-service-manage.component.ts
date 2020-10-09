import { Component, OnInit, TemplateRef, ViewChild, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CanComponentDeactivate } from 'src/app/utils/guards/route.guard';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderByPipe } from 'src/app/utils/pipes/order-by/order-by.pipe';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'odp-nano-service-manage',
    templateUrl: './nano-service-manage.component.html',
    styleUrls: ['./nano-service-manage.component.scss'],
    providers: [OrderByPipe]
})
export class NanoServiceManageComponent implements OnInit, OnDestroy, CanComponentDeactivate {

    @ViewChild('inputNode', { static: false }) inputNode: ElementRef;
    @ViewChild('outputNode', { static: false }) outputNode: ElementRef;
    @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('keyValModalTemplate', { static: false }) keyValModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('dataChangeModalTemplate', { static: false }) dataChangeModalTemplate: TemplateRef<HTMLElement>;
    pageChangeModalTemplateRef: NgbModalRef;
    keyValModalTemplateRef: NgbModalRef;
    dataChangeModalTemplateRef: NgbModalRef;
    app: string;
    form: FormGroup;
    edit: any;
    breadcrumbPaths: Array<Breadcrumb>;
    subscriptions: any;
    showLazyLoader: boolean;
    deleteModal: any;
    dataList: Array<any>;
    searchTerm: string;
    oldData: any;
    headerData: any;
    activeTab: number;
    flowSearchTerm: string;
    microflows: Array<any>;
    @HostListener('window:beforeunload', ['$event'])
    public beforeunloadHandler($event) {
        if (this.form.dirty) {
            $event.returnValue = 'Are you sure?';
        }
    }
    constructor(private commonService: CommonService,
        private appService: AppService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private orderBy: OrderByPipe,
        private ts: ToastrService) {
        const self = this;
        self.subscriptions = {};
        self.deleteModal = {};
        self.dataList = [];
        self.edit = {
            status: false,
            id: null,
            editClicked: false
        };
        self.form = self.fb.group({
            name: [null, [Validators.required, Validators.maxLength(40)]],
            description: [null, [Validators.maxLength(250)]],
            in: self.fb.group({
                type: [null, [Validators.required]],
                id: [],
                name: [],
                attributeCount: [],
                formatType: [],
                excelType: [],
                character: [],
                lineSeparator: ['\\n']
            }),
            out: self.fb.group({
                type: [null, [Validators.required]],
                id: [],
                name: [],
                attributeCount: [],
                formatType: [],
                excelType: [],
                character: [],
                lineSeparator: ['\\n']
            }),
            url: [null, [Validators.required]],
            allowTrustedConnections: [false, [Validators.required]],
            headers: [null]
        });
        self.breadcrumbPaths = [];
        self.headerData = {};
        self.activeTab = 0;
        self.microflows = [];
    }

    ngOnInit() {
        const self = this;
        self.route.params.subscribe(_params => {
            if (_params && _params.id) {
                self.edit.id = _params.id;
                if (self.appService.edit) {
                    self.edit.editClicked = true;
                    self.appService.edit = null;
                    self.edit.status = true;
                }
                self.getNanoService(_params.id);
            } else {
                self.edit.status = true;
            }
        });
    }


    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(_key => {
            if (self.subscriptions[_key]) {
                self.subscriptions[_key].unsubscribe();
            }
        });
        if (self.pageChangeModalTemplateRef) {
            self.pageChangeModalTemplateRef.close(false);
        }
        if (self.dataChangeModalTemplateRef) {
            self.dataChangeModalTemplateRef.close(false);
        }
    }

    canDeactivate(): Promise<any> | boolean {
        const self = this;
        if (self.form.dirty) {
            return new Promise((resolve, reject) => {
                self.pageChangeModalTemplateRef = this.commonService.modal(this.pageChangeModalTemplate);
                self.pageChangeModalTemplateRef.result.then(close => {
                    resolve(close);
                }, dismiss => {
                    resolve(false);
                });
            });
        }
        return true;
    }

    cancel() {
        const self = this;
        if (self.form.dirty) {
            self.pageChangeModalTemplateRef = self.commonService.modal(self.pageChangeModalTemplate);
        } else {
            if (!self.edit.status || self.edit.editClicked || !self.edit.id) {
                self.router.navigate(['/app', self.commonService.app._id, 'nsl']);
            } else {
                if (!self.edit.editClicked) {
                    self.edit.status = false;
                }
            }
            return;
        }
        self.pageChangeModalTemplateRef.result.then(close => {
            if (close) {
                self.form.markAsPristine();
                if (!self.edit.status || self.edit.editClicked || !self.edit.id) {
                    self.router.navigate(['/app', self.commonService.app._id, 'nsl']);
                } else {
                    if (!self.edit.editClicked) {
                        self.edit.status = false;
                    }
                }
            }
        }, dismiss => { });
    }

    getNanoService(id: string) {
        const self = this;
        self.subscriptions['getNanoService'] = self.commonService.get('partnerManager', '/nanoService/' + id).subscribe(res => {
            self.oldData = self.appService.cloneObject(res);
            delete self.oldData.__v;
            delete self.oldData._metadata;
            delete self.oldData._id;
            if (!Array.isArray(res.headers)) {
                delete res.headers;
            }
            self.form.patchValue(res);
            self.getMicroflows(id);
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    saveNanoService() {
        const self = this;
        const payload = self.form.value;
        payload.app = self.commonService.app._id;

        if (!payload.url) {
            self.ts.error("Please fill the required Field");
            return;
        }
        if (!payload.in.type) {
            self.ts.error("Please selct the Data Structure for Input Data");
            return;
        }
        if (!payload.out.type) {
            self.ts.error("Please selct the Data Structure for Output Data");
            return;
        }
        if (!self.canEditNanoService) {
            delete payload.app;
            delete payload.name;
            delete payload.description;
        }
        if (!self.hasPermission('PMNSIO', 'NS')) {
            delete payload.in;
            delete payload.out;
        }
        if (!self.hasPermission('PMNSH', 'NS')) {
            delete payload.headers;
        }
        if (!self.hasPermission('PMNSURL', 'NS')) {
            delete payload.url;
        }


        delete payload.allowTrustedConnections;
        if (_.isEqual(payload, self.oldData)) {
            self.triggerSave(payload);
        } else {
            self.dataChangeModalTemplateRef = self.commonService.modal(self.dataChangeModalTemplate);
            self.dataChangeModalTemplateRef.result.then(close => {
                if (close) {
                    self.triggerSave(payload);
                }
            }, dismiss => { });
        }
    }

    get canEditNanoService() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        }
        const list = self.commonService.getEntityPermissions('NS_' + self.edit.id);
        if (list.length === 0 && self.commonService.hasPermission('PMNSBU')) {
            return true;
        } else if (list.length > 0 && list.find(e => e.id === 'PMNSBU')) {
            return true;
        } else {
            return false;
        }
    }

    haveBasicCreateOrUpdate() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            return self.hasPermission('PMNSBC') || self.hasPermission('PMNSBU');
        }
    }

    triggerSave(payload: any) {
        const self = this;
        let request;
        if (self.edit.id) {
            request = self.commonService.put('partnerManager', '/nanoService/' + self.edit.id, payload);
        } else {
            request = self.commonService.post('partnerManager', '/nanoService', payload);
        }
        self.subscriptions['saveNanoService'] = request.subscribe(res => {
            self.edit.status = false;
            self.form.reset();
            self.router.navigate(['/app', self.commonService.app._id, 'nsl']);
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    openHeadersModal(data?: any) {
        const self = this;
        if (!self.edit.status) {
            return;
        }
        if (data) {
            self.headerData = data;
            self.headerData.isEdit = true;
        }
        self.keyValModalTemplateRef = self.commonService
            .modal(self.keyValModalTemplate, { centered: true, windowClass: 'key-value-modal' });
        self.keyValModalTemplateRef.result.then(close => {
            if (close) {
                let temp: Array<any> = self.form.get('headers').value;
                if (!temp) {
                    temp = [];
                }
                const tempIndex = temp.findIndex(e => e.key === self.headerData.key);
                if (tempIndex > -1) {
                    temp.splice(tempIndex, 1);
                }
                temp.push({
                    key: self.headerData.key,
                    value: self.headerData.value,
                    header: self.convertHeader(self.headerData.key)
                });
                self.form.get('headers').patchValue(temp);
            }
            self.headerData = {};
        }, dismiss => {
            self.headerData = {};
        });
    }

    convertHeader(key: string) {
        if (key) {
            return 'ODP-NS-' + key.split(' ')
                .filter(e => e)
                .map(e => e.charAt(0).toUpperCase() + e.substr(1, e.length))
                .join('-');
        }
        return null;
    }

    removeHeader(key: string) {
        const self = this;
        const temp = self.form.get('headers').value;
        const tempIndex = temp.findIndex(e => e.key === key);
        if (tempIndex > -1) {
            temp.splice(tempIndex, 1);
        }
        self.form.get('headers').patchValue(temp);
    }

    setInputFormat(data: any) {
        const self = this;
        self.form.get('in.id').patchValue(data._id);
        self.form.get('in.type').patchValue(data.type);
        self.form.get('in.name').patchValue(data.name);
        self.form.get('in.attributeCount').patchValue(data.attributeCount);
        self.form.get('in.formatType').patchValue(data.formatType);
        self.form.get('in.excelType').patchValue(data.excelType);
        self.form.get('in.character').patchValue(data.character);
        self.form.get('in.lineSeparator').patchValue(data.lineSeparator);
    }

    setOutputFormat(data: any) {
        const self = this;
        self.form.get('out.id').patchValue(data._id);
        self.form.get('out.type').patchValue(data.type);
        self.form.get('out.name').patchValue(data.name);
        self.form.get('out.attributeCount').patchValue(data.attributeCount);
        self.form.get('out.formatType').patchValue(data.formatType);
        self.form.get('out.excelType').patchValue(data.excelType);
        self.form.get('out.character').patchValue(data.character);
        self.form.get('out.lineSeparator').patchValue(data.lineSeparator);
    }

    removeDataStructure(type: string) {
        const self = this;
        self.form.get(type).setValue({
            id: null,
            type: null,
            name: null,
            attributeCount: null,
            formatType: null,
            excelType: null,
            character: null,
            lineSeparator: '\\n'
        });
    }

    canManageNanoService(id: string) {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        }
        const list = self.commonService.getEntityPermissions('NS_' + self.edit.id);
        if (list.length === 0 && self.commonService.hasPermissionStartsWith('PMNS')) {
            return true;
        } else if (list.length > 0 && list.find(e => e.id.substr(0, 4) === 'PMNS')) {
            return true;
        } else {
            return false;
        }
    }

    getMicroflows(id: string) {
        const self = this;
        const options: GetOptions = {
            filter: {
                nanoService: id
            }
        };
        self.microflows = [];
        self.commonService.get('partnerManager', '/flow', options).subscribe(res => {
            if (res && res.length > 0) {
                res.forEach(item => {
                    const inAgent = item.blocks.find(e => e.meta.blockType === 'INPUT');
                    if (inAgent) {
                        self.getAgentName(inAgent.meta.source, inAgent.meta);
                    }
                    const outAgent = item.blocks.find(e => e.meta.blockType === 'OUTPUT');
                    if (outAgent) {
                        self.getAgentName(outAgent.meta.target, outAgent.meta);
                    }
                    self.setOutputType(item);
                    self.microflows.push(item);
                });
                self.microflows = self.orderBy.transform(self.microflows, 'name');
            }
        }, err => {

        });
    }

    getStatus(status: string) {
        if (status === 'Draft') {
            return 'draft';
        }
        if (status === 'Active') {
            return 'online';
        }
        if (status === 'Error') {
            return 'error';
        }
        if (status === 'Pending') {
            return 'pending';
        }
        return 'offline';
    }

    getAPIEnpoint(item: any) {
        const temp = item.blocks[item.blocks.length - 1];
        if (temp) {
            return temp.meta.connectionDetails.url;
        }
        return null;
    }

    getInAgent(item: any) {
        const self = this;
        const temp = item.blocks.find(e => e.meta.blockType === 'INPUT');
        if (temp) {
            return temp.meta.agentName;
        }
        return null;
    }

    getOutAgent(item: any) {
        const self = this;
        const temp = item.blocks.find(e => e.meta.blockType === 'OUTPUT');
        if (temp) {
            return temp.meta.agentName;
        }
        return null;
    }

    getAgentName(id: string, data: any) {
        const self = this;
        self.commonService.get('partnerManager', '/agentRegistry', {
            select: 'name',
            filter: {
                agentID: id
            }
        }).subscribe(res => {
            if (res && res.length > 0) {
                data.agentName = res[0].name;
            }
        }, err => {

        });
    }

    copyToClipboard(type: string) {
        const self = this;
        if (type === 'input') {
            self.inputNode.nativeElement.select();
        } else {
            if (self.outputNode && self.outputNode.nativeElement) {
                self.outputNode.nativeElement.select();
            }
        }
        document.execCommand('copy');
    }

    setOutputType(item: any) {
        const self = this;
        if (item.blocks && item.blocks.length > 1 && !item.outputType) {
            item.outputType = 'API';
        }
    }

    replacePort(url: string, port: number) {
        if (url && port) {
            const arr = url.split(':');
            arr.pop();
            arr.push(port + '');
            return location.protocol + '//' + arr.join(':') + '/api';
        } else {
            return location.protocol + '//' + url + '/api';
        }
    }

    set name(val) {
        const self = this;
        self.form.get('name').patchValue(val);
        self.form.get('name').markAsDirty();
    }

    get name() {
        const self = this;
        if (self.form.get('name')) {
            return self.form.get('name').value;
        }
        return null;
    }

    set description(val) {
        const self = this;
        self.form.get('description').patchValue(val);
        self.form.get('description').markAsDirty();
    }

    get description() {
        const self = this;
        if (self.form.get('description')) {
            return self.form.get('description').value;
        }
        return null;
    }

    get keyValList() {
        const self = this;
        return self.form.get('headers').value;
    }

    get selectedInType() {
        const self = this;
        const val = self.form.get('in.type').value;
        if (val === 'none') {
            return null;
        }
        return val;
    }

    get selectedOutType() {
        const self = this;
        const val = self.form.get('out.type').value;
        if (val === 'none') {
            return null;
        }
        return val;
    }

    set checkedControl(val) {
        const self = this;
        self.form.get('allowTrustedConnections').patchValue(val);
    }

    get checkedControl() {
        const self = this;
        return self.form.get('allowTrustedConnections').value;
    }

    get restrictToFormat() {
        const self = this;
        return ['JSON', 'XML', 'BINARY'];
    }

    hasDesignTabViewPermission() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        }
        const list = self.commonService.getEntityPermissions('NS_' + self.edit.id);
        let inAllPermission = false;
        let inListPermission = false;

        if (self.edit.status) {
            inAllPermission = (self.hasPermission('PMNSURL', 'NS') || self.hasPermission('PMNSH', 'NS')
                || self.hasPermission('PMNSIO', 'NS'));
            inListPermission = Boolean(list.find(e => e.id.substring(2, 4) === 'NS'));
        } else {
            inAllPermission = (self.hasPermission('PVNSURL', 'NS') || self.hasPermission('PVNSH', 'NS')
                || self.hasPermission('PVNSIO', 'NS') || self.hasPermission('PMNSURL', 'NS') ||
                self.hasPermission('PMNSH', 'NS') || self.hasPermission('PMNSIO', 'NS'));
            inListPermission = Boolean(list.find(e => e.id.substring(0, 4) === 'PVNS'));
        }
        if (list.length === 0 && inAllPermission) {
            return true;
        }
        return list.length > 0 && inListPermission;
    }

    hasDetailViewPermission() {
        const self = this;
        return (self.hasPermission('PVNSURL') || self.hasPermission('PMNSURL') || self.hasPermission('PVNSH')
            || self.hasPermission('PMNSH'));
    }

    hasPermission(roleId: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermission(roleId, entity);
    }
}
