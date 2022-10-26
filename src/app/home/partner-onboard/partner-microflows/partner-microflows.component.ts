import { Component, OnInit, Output, EventEmitter, Input, ViewChild, TemplateRef, OnDestroy, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { OrderByPipe } from 'src/app/utils/pipes/order-by/order-by.pipe';
import { IntegrationFlowService } from 'src/app/utils/integration-flow/integration-flow.service';

@Component({
    selector: 'odp-partner-microflows',
    templateUrl: './partner-microflows.component.html',
    styleUrls: ['./partner-microflows.component.scss'],
    providers: [OrderByPipe]
})
export class PartnerMicroflowsComponent implements OnInit, OnDestroy {

    @ViewChild('inputNode', { static: false }) inputNode: ElementRef;
    @ViewChild('outputNode', { static: false }) outputNode: ElementRef;
    @ViewChild('apiType', { static: false }) apiType: ElementRef;
    @ViewChild('fileType', { static: false }) fileType: ElementRef;
    @ViewChild('alertModalTemplate', { static: false }) alertModalTemplate: TemplateRef<HTMLElement>;
    @Input() partner: FormGroup;
    @Output() openMicroflow: EventEmitter<any>;
    @Input() edit: any;
    newIntegrationFlowData: any;
    toggleNewIntegrationFlow: boolean;
    alertModalTemplateRef: NgbModalRef;
    alertModalData: any;
    form: FormGroup;
    flowOptions: any;
    searchTerm: string;
    modalData: any;
    subscriptions: any;
    microflows: Array<any>;
    openDeleteModal: EventEmitter<any>;
    alertModal: {
        statusChange?: boolean;
        title: string;
        message: string;
        index: any;
    };
    toggleEdgeGateway: any;
    apiCalls: any;
    constructor(private commonService: CommonService,
        private appService: AppService,
        private flowService: IntegrationFlowService,
        private ts: ToastrService,
        private fb: FormBuilder,
        private orderBy: OrderByPipe) {
        const self = this;
        self.openMicroflow = new EventEmitter();
        self.form = self.fb.group({
            name: [null, [Validators.required, Validators.maxLength(20)]],
            description: [null],
            direction: ['Inbound', [Validators.required]],
            inputType: [null, [Validators.required]],
        });
        self.flowOptions = {};
        self.modalData = {};
        self.subscriptions = {};
        self.microflows = [];
        self.alertModalData = {};
        self.openDeleteModal = new EventEmitter();
        self.alertModal = {
            statusChange: false,
            title: '',
            message: '',
            index: null
        };
        self.toggleEdgeGateway = {};
        self.apiCalls = {};
    }

    ngOnInit() {
        const self = this;
        self.commonService.viewMicroFlow = false;
        const temp: Array<string> = self.partner.get('flows').value;
        if (temp) {
            temp.forEach(flowId => {
                self.fetchMicroflow(flowId);
            });
        }
        self.subscriptions['flow.delete'] = self.commonService.flow.delete.subscribe(data => {
            const index = self.microflows.findIndex(s => s._id === data._id);
            self.ts.success('Deleted ' + self.microflows[index].name + '.');
            if (index > -1) {
                self.microflows.splice(index, 1);
            }
        });
        self.subscriptions['flow.status'] = self.commonService.flow.status.subscribe(data => {
            const index = self.microflows.findIndex(s => s._id === data._id);
            if (index === -1) {
                return;
            }
            if (data.message === 'Stopped') {
                self.microflows[index].status = 'Stopped';
                self.ts.success('Stopped ' + self.microflows[index].name + '.');
            } else if (data.message === 'Active') {
               
                self.fetchFlow(data._id, index);
            } else if (data.message === 'Pending') {
                self.microflows[index].status = 'Pending';
            }
        });
       
    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(key => {
            if (self.subscriptions[key]) {
                self.subscriptions[key].unsubscribe();
            }
        });
        if (self.alertModalTemplateRef) {
            self.alertModalTemplateRef.close(false);
        }
    }

    fetchMicroflow(id: string) {
        const self = this;
        if (self.hasPermissionForFlow(id)) {
            const index = self.microflows.findIndex(e => e._id === id);
            if (index > -1) {
                return;
            }
            const option: GetOptions = {
                filter: {
                    app: self.commonService.app._id,
                    runningFlow: { $exists: false }
                }
            };
            self.apiCalls.fetchMicroflow = true;
            self.commonService.get('partnerManager', `/${this.commonService.app._id}/flow/` + id, option).subscribe(res => {
                self.apiCalls.fetchMicroflow = false;
                const inAgent = res.blocks.find(e => e.meta.blockType === 'INPUT');
                if (inAgent) {
                    self.getAgentName(inAgent.meta.source, inAgent.meta);
                }
                const outAgent = res.blocks.find(e => e.meta.blockType === 'OUTPUT');
                if (outAgent) {
                    self.getAgentName(outAgent.meta.target, outAgent.meta);
                }
                self.setOutputType(res);
                self.isFlowInvalid(res);
                self.microflows.push(res);
                self.microflows = self.orderBy.transform(self.microflows, 'name');
            }, err => {
                self.apiCalls.fetchMicroflow = false;
                self.commonService.errorToast(err);
            });
        }
    }


    fetchFlow(id: string, index: number) {
        const self = this;
        if (self.hasPermissionForFlow(id)) {
            const option: GetOptions = {
                filter: {
                    app: self.commonService.app._id,
                    runningFlow: { $exists: false }
                }
            };
            self.apiCalls.fetchMicroflow = true;
            self.commonService.get('partnerManager', `/${this.commonService.app._id}/flow/` + id, option).subscribe(res => {
                self.apiCalls.fetchMicroflow = false;
                res.agentName = self.microflows[index].agentName;
                res.outputType = self.microflows[index].outputType;
                res.invalid = self.microflows[index].invalid;
                self.microflows[index] = res;
                self.ts.success('Started ' + self.microflows[index].name + '.');

            }, err => {
                self.apiCalls.fetchMicroflow = false;
                self.commonService.errorToast(err);
            });
        }
    }

    hasPermissionForFlow(id: string) {
        const self = this;
        return self.hasPermission('PVPFMB')
            || self.hasPermissionStartsWith('PMPFMB')
            || self.hasPermission('PMPFPS')
            || self.hasPermission('PMPFPD');
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

    viewMicroflow(id?: string) {
        const self = this;
        self.toggleNewIntegrationFlow = false;
        self.flowService.onlyView = true;
        self.commonService.viewMicroFlow = true;
        self.openMicroflow.emit(id);
    }

    toggleMicroflow(id?: string) {
        const self = this;
        self.toggleNewIntegrationFlow = false;
        self.flowService.onlyView = false;
        self.commonService.viewMicroFlow = false;
        self.openMicroflow.emit(id);
    }

    newMicroflow() {
        const self = this;
        self.newIntegrationFlowData = {
            inputType: 'api',
            direction: 'Inbound'
        };
        self.toggleNewIntegrationFlow = true;
    }

    onDone(data) {
        const self = this;
        self.toggleNewIntegrationFlow = false;
        self.saveFlow();
    }

    saveFlow() {
        const self = this;
        const payload = self.newIntegrationFlowData;
        payload.partner = self.partner.get('_id').value;
        payload.app = self.commonService.app._id;
        delete payload.inputType;
        self.apiCalls.saveFlow = true;
        self.commonService.post('partnerManager', `/${this.commonService.app._id}/flow`, payload).subscribe(res => {
            self.apiCalls.saveFlow = false;
            let temp = self.partner.get('flows').value;
            if (!temp) {
                temp = [];
            }
            temp.push(res._id);
            self.partner.get('flows').patchValue(temp);
            self.microflows.push(res);
            self.microflows = self.orderBy.transform(self.microflows, 'name');
            self.toggleMicroflow(res._id);
        }, err => {
            self.apiCalls.saveFlow = false;
            self.commonService.errorToast(err);
        });
    }

    stopFlow(flow: any) {
        const self = this;
        self.alertModalData = {};
        self.alertModalData.title = 'Stop flow';
        self.alertModalData.message = 'Are you sure you want to stop <span class="text-dark font-weight-bold">'
            + flow.name + '</span> agent?';
        self.alertModalTemplateRef = self.commonService.modal(self.alertModalTemplate);
        self.alertModalTemplateRef.result.then(close => {
            if (close) {
                self.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/utils/${flow._id}/stop`, { app: this.commonService.app._id }).subscribe(res => {
                    self.ts.success('Stopping flow');
                    flow.status = 'Pending';
                }, err => {
                    self.commonService.errorToast(err);
                });
            }
        }, dismiss => { });
    }

    startFlow(flow: any) {
        const self = this;
        self.alertModalData = {};
        self.alertModalData.title = 'Start flow';
        self.alertModalData.message = 'Are you sure you want to start <span class="text-dark font-weight-bold">'
            + flow.name + '</span> agent?';
        self.alertModalTemplateRef = self.commonService.modal(self.alertModalTemplate);
        self.alertModalTemplateRef.result.then(close => {
            if (close) {
                self.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/utils/${flow._id}/start`, { app: this.commonService.app._id }).subscribe(res => {
                    self.ts.success('Starting flow');
                    flow.status = 'Pending';
                }, err => {
                    self.commonService.errorToast(err);
                });
            }
        }, dismiss => { });
    }

    deployFlow(flow: any) {
        const self = this;
        self.alertModalData = {};
        self.alertModalData.title = 'Deploy flow';
        self.alertModalData.message = 'Are you sure you want to deploy <span class="text-dark font-weight-bold">'
            + flow.name + '</span> agent?';
        self.alertModalTemplateRef = self.commonService.modal(self.alertModalTemplate);
        self.alertModalTemplateRef.result.then(close => {
            if (close) {
                self.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/utils/${flow._id}/deploy`, { app: this.commonService.app._id }).subscribe(res => {
                    self.ts.success('Deploying flow');
                    flow.status = 'Pending';
                }, err => {
                    self.commonService.errorToast(err);
                });
            }
        }, dismiss => { });
    }

    cloneFlow(flow: any) {
        const self = this;
        const temp = self.appService.cloneObject(flow);
        delete temp._id;
        delete temp.__v;
        delete temp._metadata;
        delete temp.version;
        delete temp.flowStatus;
        delete temp.status;
        delete temp.port;
    }

    deleteFlow(index: number) {
        const self = this;
        const temp = self.microflows[index];
        self.alertModal.statusChange = false;
        self.alertModal.title = 'Delete Flow';
        self.alertModal.message = 'Are you sure you want to delete flow <span class="text-danger font-weight-bold">' + temp.name
            + '</span>?';
        self.alertModal.index = index;
        self.openDeleteModal.emit(self.alertModal);
    }

    closeDeleteModal(data) {
        const self = this;
        if (data) {
            const temp = self.microflows[data.index];
            if (self.subscriptions['deleteFlow']) {
                self.subscriptions['deleteFlow'].unsubscribe();
            }
            self.subscriptions['deleteFlow'] = self.commonService.delete('partnerManager', `/${this.commonService.app._id}/flow/${temp._id}`).subscribe(res => {
                self.ts.success('Flow Deleted');
                self.microflows.splice(data.index, 1);
                let arr: Array<string> = self.partner.get('flows').value;
                if (!arr) {
                    arr = [];
                }
                const arrIndex = arr.indexOf(temp._id);
                if (arrIndex > -1) {
                    arr.splice(arrIndex, 1);
                }
                self.partner.get('flows').patchValue(arr);
            }, err => {
                self.commonService.errorToast(err);
            });
        }
    }

    isFlowInvalid(flow: any) {
        const self = this;
        const items = [];
        let blocks = [];
        if (!flow || !flow.blocks) {
            return true;
        }
        flow.invalid = false;
        blocks = [].concat.call([], self.flowService.parseNodes(flow.blocks, true),
            self.flowService.parseNodes(flow.successBlocks, true));
        const errBlocks = self.flowService.parseNodes(flow.errorBlocks, true);
        blocks.forEach((node: any, i: number, a: Array<any>) => {
            if (i > 0) {
                items.push(self.flowService.getNodeErrors(flow, node, a[i - 1]));
            } else {
                items.push(self.flowService.getNodeErrors(flow, node));
            }
        });
        errBlocks.forEach((node: any, i: number, a: Array<any>) => {
            if (i > 0) {
                items.push(self.flowService.getNodeErrors(flow, node, a[i - 1]));
            } else {
                items.push(self.flowService.getNodeErrors(flow, node, self.flowService.getErrorNode()));
            }
        });
        const allErrors = [].concat.apply([], items.map(e => Object.keys(e)));
        flow.invalid = allErrors.filter(e => e !== 'currFormatChanged' && e !== 'prevFormatChanged').length > 0;
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
        self.commonService.get('partnerManager', `/${this.commonService.app._id}/agent`, {
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

    hasPermission(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermission(type, entity);
    }

    hasPermissionStartsWith(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermissionStartsWith(type, entity);
    }

    canDeployFlow(id: string) {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            const list = self.commonService.getEntityPermissions('PM_' + id);
            if (list.length > 0) {
                return Boolean(list.find(e => e.id === 'PMPFPD'));
            } else {
                return self.commonService.hasPermission('PMPFPD');
            }
        }
    }

    canStartStopFlow(id: string) {
        const self = this;
        const temp = self.microflows.find(e => e._id === id);
        if (temp.status !== 'Stopped' && temp.status !== 'Active') {
            return false;
        }
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            const list = self.commonService.getEntityPermissions('FLOW_' + id);
            if (list.length > 0) {
                return Boolean(list.find(e => e.id === 'PMPFPS'));
            } else {
                return self.commonService.hasPermission('PMPFPS');
            }
        }
    }

    canCreateFlow() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            return (self.commonService.hasPermission('PMPFMBC', 'PM') ||
                self.commonService.hasPermission('PMPFMBU', 'PM') ||
                self.commonService.hasPermission('PMPFMBD', 'PM'));
        }
    }

    canEditFlow(id: string) {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            const list = self.commonService.getEntityPermissions('PM_' + id);
            if (list.length > 0) {
                return Boolean(list.find(e => e.id === 'PMPFMBU'));
            } else {
                return self.commonService.hasPermission('PMPFMBU');
            }
        }
    }

    canDeleteFlow(id: string) {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            const list = self.commonService.getEntityPermissions('PM_' + id);
            if (list.length > 0) {
                return Boolean(list.find(e => e.id === 'PMPFMBD'));
            } else {
                return self.commonService.hasPermission('PMPFMBD');
            }
        }
    }

    get checkAll() {
        const self = this;
        if (self.microflows.length === 0) {
            return false;
        } else {
            return Math.min.apply(null, self.microflows.map(e => e.selected));
        }
    }
    set checkAll(val) {
        const self = this;
        self.microflows.forEach(e => {
            e.selected = val;
        });
    }

    get pendingApiCalls() {
        const self = this;
        return Object.values(self.apiCalls).filter(e => e).length > 0;
    }
}
