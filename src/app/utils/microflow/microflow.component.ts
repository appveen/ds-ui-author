import { Component, OnInit, Renderer2, Input, EventEmitter, Output, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { debounceTime, map, catchError } from 'rxjs/operators';

import { AppService } from '../services/app.service';
import { CommonService, GetOptions } from '../services/common.service';
import { SchemaBuilderService } from 'src/app/home/schema-utils/schema-builder.service';

@Component({
    selector: 'odp-microflow',
    templateUrl: './microflow.component.html',
    styleUrls: ['./microflow.component.scss']
})
export class MicroflowComponent implements OnInit, OnDestroy {

    @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('selectWSDLOperationTemplate', { static: false }) selectWSDLOperationTemplate: TemplateRef<HTMLElement>;
    @Input() toggleMicroflow: boolean;
    @Output() toggleMicroflowChange: EventEmitter<boolean>;
    @Input() id: any;
    @Output() idChange: EventEmitter<any>;
    @Input() partner: FormGroup;
    showLazyLoader: boolean;
    items: Array<SVGData>;
    designCanvas: HTMLElement;
    windowWidth: number;
    windowHeight: number;
    zoomFactor: number;
    panX: number;
    mouseDown: boolean;
    flowEnded: number;
    toggleChangeTo: boolean;
    formatList: Array<any>;
    subscriptions: any;
    openMapper: boolean;
    data: any;
    transformPhase: Array<{ index: number; data: NodeData }>;
    agentList: Array<any>;
    profileList: Array<any>;
    toggleAddIcon: any;
    pageChangeModalTemplateRef: NgbModalRef;
    selectWSDLOperationTemplateRef: NgbModalRef;
    wsdlOperations: any;
    searchTerm: string;
    alertModal: {
        statusChange?: boolean;
        title: string;
        message: string;
    };
    openDeleteModal: EventEmitter<any>;
    oldValue: any;
    fileExtentionList: Array<string>;
    constructor(private renderer: Renderer2,
        public commonService: CommonService,
        private appService: AppService,
        private schemaService: SchemaBuilderService,
        private ts: ToastrService) {
        const self = this;
        self.items = [];
        self.zoomFactor = 1;
        self.panX = 0;
        self.toggleMicroflowChange = new EventEmitter();
        self.idChange = new EventEmitter();
        self.flowEnded = -1;
        self.formatList = [];
        self.profileList = [];
        self.subscriptions = {};
        self.data = {
            direction: 'Inbound'
        };
        self.transformPhase = [];
        self.agentList = [];
        self.toggleAddIcon = {};
        self.alertModal = {
            statusChange: false,
            title: '',
            message: ''
        };
        self.openDeleteModal = new EventEmitter();
        self.fileExtentionList = [
            'json',
            'xml',
            'csv',
            'xls',
            'xlsx',
            'doc',
            'docx',
            'pdf',
            'jpg',
            'png',
            'gif',
        ];
    }

    ngOnInit() {
        const self = this;
        self.renderer.listen('body', 'mouseup', ($event) => {
            self.mouseDown = false;
        });
        self.designCanvas = document.getElementById('designCanvas') as HTMLElement;
        self.calibrateWindowDimension();
        self.drawGrid();
        if (self.id) {
            self.items = [];
            self.getMicroflowData();
        } else {
            self.items = self.getItems();
            self.reCalculateCorrdinates();
        }
        self.getAgents();
    }

    ngOnDestroy() {
        const self = this;
        if (self.selectWSDLOperationTemplateRef) {
            self.selectWSDLOperationTemplateRef.close(false);
        }
        Object.keys(self.subscriptions).forEach(key => {
            if (self.subscriptions[key]) {
                self.subscriptions[key].unsubscribe();
            }
        });
    }

    cancel() {
        const self = this;
        if (self.changesDone) {
            self.pageChangeModalTemplateRef = self.commonService.modal(self.pageChangeModalTemplate);
        } else {
            self.toggleMicroflowChange.emit(false);
            return;
        }
        self.pageChangeModalTemplateRef.result.then(close => {
            if (close) {
                self.toggleMicroflowChange.emit(false);
            }
        }, dismiss => { });
    }

    save(deploy?: boolean) {
        const self = this;
        const blocks: Array<NodeData> = self.items.map(e => e.data);
        blocks.forEach((e, i, a) => {
           
            e.sequenceNo = (i + 1);
            if (e.sourceFormat && e.sourceFormat.definition && typeof e.sourceFormat.definition === 'object') {
                e.sourceFormat.definition = JSON.stringify(e.sourceFormat.definition);
            }
            if (e.targetFormat && e.targetFormat.definition && typeof e.targetFormat.definition === 'object') {
                e.targetFormat.definition = JSON.stringify(e.targetFormat.definition);
            }
            if (!e.meta.connectionDetails) {
                e.meta.connectionDetails = {};
            }
            e.meta.connectionDetails.multipartAttribute = 'fileName';
            if (i > 0) {
                const t = a[i - 1];
                if ((e.meta.xslt || e.source !== t.target)) {
                    const temp: NodeData = self.appService.cloneObject(e);
                    temp.meta.blockType = 'PROCESS';
                    temp.meta.processType = 'TRANSFORM';
                    temp.sourceFormat = t.targetFormat;
                    temp.source = t.target;
                    temp.targetFormat = e.sourceFormat;
                    temp.target = e.source;
                    if (!temp.meta.xslt) {
                        temp.meta.xslt = '{}';
                    }
                    if (typeof temp.meta.xslt === 'object') {
                        temp.meta.xslt = JSON.stringify(temp.meta.xslt);
                    }
                    delete temp.meta.formatId;
                    delete temp.meta.formatName;
                    delete temp.meta.connectionDetails;
                    delete temp.meta.formatType;
                    delete temp.meta.character;
                    delete temp.meta.contentType;
                    delete temp.meta.sourceType;
                    delete temp.meta.targetType;
                    delete temp.meta.source;
                    delete temp.meta.target;
                    delete temp.name;
                    self.transformPhase.push({ index: i, data: temp });
                    delete e.mapping;
                    delete e.meta.xslt;
                }
            }
            if (e.meta.customHeadersList && e.meta.customHeadersList.length > 0) {
                e.meta.customHeaders = self.getHeaders(e.meta.customHeadersList);
            }
        });
        self.transformPhase.forEach((e, i) => {
            blocks.splice(e.index + i, 0, e.data);
        });
        self.data.structures = blocks.map((e: NodeData) => {
            const t: any = {};
            if (e.target) {
                t.id = e.targetFormat.id;
                t.customId = e.target;
            }
            if (e.targetFormat && e.targetFormat.definition) {
                t.type = e.targetFormat.type;
                if (e.targetFormat.definition && typeof e.targetFormat.definition === 'string') {
                    t.definition = JSON.parse(e.targetFormat.definition);
                }
                if (t.definition && t.definition._id) {
                    t.definition._id.type = 'String';
                    delete t.definition._id.counter;
                    delete t.definition._id.suffix;
                    delete t.definition._id.padding;
                }
                if (t.definition && typeof t.definition === 'object') {
                    t.definition = JSON.stringify(t.definition);
                }
                t.meta = {
                    contentType: e.targetFormat.formatType || 'JSON',
                    character: e.targetFormat.character,
                    fileDetails: e.meta.fileDetails,
                    wsdlContent: e.meta.wsdlContent,
                    tagName: e.meta.inputName,
                    tagType: e.meta.inputType,
                    operation: e.meta.operation,
                    part: 'INPUT'
                };
            } else {
                t.definition = '{}';
                t.meta = {
                    contentType: (e.targetFormat ? e.targetFormat.formatType : null) || 'JSON'
                };
            }
            return t;
        }).filter(e => Object.keys(e).length > 0);
        self.data.blocks = blocks;
        self.data.app = self.commonService.app._id;
        self.data.partner = self.partnerId;
        let request;
        if (self.id) {
            request = self.commonService.put('partnerManager', '/flow/' + self.id, self.data);
        } else {
            request = self.commonService.post('partnerManager', '/flow', self.data);
        }
        request.subscribe(res => {
            if (deploy) {
                self.deploy();
            } else {
                self.ts.success('Flow saved successfully');
                self.toggleMicroflowChange.emit(false);
            }
            self.idChange.emit(res._id);
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    deploy() {
        const self = this;
        self.commonService.put('partnerManager', '/flow/' + self.id + '/deploy', {}).subscribe(res => {
            self.ts.success('Flow saved and deployed successfully');
            self.toggleMicroflowChange.emit(false);
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    getMicroflowData() {
        const self = this;
        self.commonService.get('partnerManager', '/flow/' + self.id).subscribe(res1 => {
            self.data = res1;
            res1.blocks.forEach((node: NodeData, i: number, a: Array<NodeData>) => {
                if (!node.meta.uniqueRemoteTransactionOptions) {
                    node.meta.uniqueRemoteTransactionOptions = {};
                }
                if (!node.meta.connectionDetails) {
                    node.meta.connectionDetails = {};
                }
                if (!node.meta.connectionDetails.trustAllCerts) {
                    node.meta.connectionDetails.trustAllCerts = false;
                }
                if (node.sourceFormat && node.sourceFormat.type !== 'custom' && node.sourceFormat.type !== 'binary') {
                    self.getFormatDetails(node.sourceFormat).then(res => {
                        self.reBuildDefinition(node, 'sourceFormat');
                    }, err => { });
                }
                if (node.sourceFormat && node.sourceFormat.type === 'binary') {
                    node.sourceFormat.definition = '{}';
                    self.reBuildDefinition(node, 'sourceFormat');
                }
                if (node.targetFormat && node.targetFormat.type !== 'custom' && node.targetFormat.type !== 'binary') {
                    self.getFormatDetails(node.targetFormat).then(res => {
                        self.reBuildDefinition(node, 'targetFormat');
                    }, err => { });
                }
                if (node.targetFormat && node.targetFormat.type === 'binary') {
                    node.targetFormat.definition = '{}';
                    self.reBuildDefinition(node, 'targetFormat');
                }
                if (node.meta.blockType === 'INPUT') {
                    self.addCircle(i, self.appService.cloneObject(node));
                } else if (node.meta.blockType === 'PROCESS' && node.meta.processType === 'REQUEST') {
                    const temp = a[i - 1];
                    if (temp.meta.blockType === 'PROCESS' && temp.meta.processType === 'TRANSFORM') {
                        node.mapping = temp.mapping;
                        node.meta.xslt = temp.meta.xslt;
                        if (typeof node.meta.xslt === 'string') {
                            node.meta.xslt = JSON.parse(node.meta.xslt);
                        }
                    }
                    self.addHexagon(i, self.appService.cloneObject(node));
                } else if (node.meta.blockType === 'OUTPUT') {
                    const temp = a[i - 1];
                    if (temp.meta.blockType === 'PROCESS' && temp.meta.processType === 'TRANSFORM') {
                        node.mapping = temp.mapping;
                        node.meta.xslt = temp.meta.xslt;
                        if (typeof node.meta.xslt === 'string') {
                            node.meta.xslt = JSON.parse(node.meta.xslt);
                        }
                    }
                    self.addSquare(i, self.appService.cloneObject(node));
                }
            });
            self.panX = 244 * (self.items.length - 1);
            self.reCalculateCorrdinates();
            self.oldValue = self.appService.cloneObject(self.items);
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    selectItem(item: SVGData) {
        const self = this;
        self.items.forEach(e => {
            e.selected = false;
        });
        item.selected = true;
        const index = self.items.findIndex(e => e.selected);
        self.panX = 244 * (self.items.length - index);
        self.clearSearch();
    }

    deleteItem(index: number) {
        const self = this;
        if (self.items.length - 1 === index) {
            self.flowEnded = -1;
        }
        let selectItem = self.items[0];
        self.items.splice(index, 1);
        if (index > 0) {
            selectItem = self.items[index - 1];
        }
        self.reCalculateCorrdinates(selectItem);
    }

    deleteBlock() {
        const self = this;
        const index = self.items.findIndex(e => e.selected);
        if (index > -1) {
            self.deleteItem(index);
        }
    }

    changeSourceType(sourceType: string) {
        const self = this;
        self.toggleChangeTo = false;
        self.selectedNode.data.meta.sourceType = sourceType;
        self.selectedNode.data.meta.targetType = sourceType;
        self.selectedNode.data.meta.contentType = null;
        if (sourceType === 'SOAP') {
            self.selectedNode.data.meta.contentType = 'XML';
        }
        const temp = self.selectedNode;
        temp.data.source = null;
        temp.data.sourceFormat = {};
        temp.data.target = null;
        temp.data.targetFormat = {};
        temp.data.meta.fileDetails = {};
        delete temp.data.meta.contentType;
        temp.data.meta.source = null;
        self.removeMapping();
        if (sourceType === 'FILE'
            && self.data.direction === 'Inbound'
            && temp.data.meta.blockType === 'INPUT') {
            temp.data.meta.source = self.agentId;
        } else {
            temp.data.meta.source = null;
        }
        if (sourceType === 'FILE'
            && self.data.direction === 'Outbound'
            && temp.data.meta.blockType === 'OUTPUT') {
            temp.data.meta.target = self.agentId;
        } else {
            temp.data.meta.source = null;
        }
    }

    changeFormatType(formatType: string) {
        const self = this;
        self.toggleChangeTo = false;
        self.selectedNode.data.meta.formatType = formatType;
        const temp = self.selectedNode;
        temp.data.source = null;
        temp.data.sourceFormat = {};
        temp.data.target = null;
        temp.data.targetFormat = {};
        self.removeMapping();
        self.formatList = [];
    }

    searchFormat(searchTerm: string) {
        const self = this;
        self.searchTerm = searchTerm;
        const options: GetOptions = {
            filter: {
                name: '/' + searchTerm + '/'
            }
        };
        let request;
        if (self.selectedNode.data.meta.formatType === 'dataService') {
            request = self.commonService.get('serviceManager', '/service', options);
        } else {
            request = self.commonService.get('partnerManager', '/nanoService', options);
        }
        request.subscribe(res => {
            self.formatList = res;
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    clearSearch() {
        const self = this;
        self.formatList = [];
        self.searchTerm = '';
    }

    selectPhase(format: any) {
        const self = this;
        const temp = self.selectedNode;
        temp.data.meta.formatId = format._id;
        temp.data.meta.formatName = format.name;
        if (temp.data.meta.formatType === 'dataService') {
            temp.data.source = self.appService.randomID(5);
            if (!temp.data.sourceFormat) {
                temp.data.sourceFormat = {};
            }
            temp.data.sourceFormat.name = format.name;
            temp.data.sourceFormat.id = format._id;
            temp.data.sourceFormat.attributeCount = format.attributeCount;
            temp.data.sourceFormat.type = 'dataService';
            temp.data.sourceFormat.formatType = 'JSON';
            temp.data.target = self.appService.randomID(5);
            if (!temp.data.targetFormat) {
                temp.data.targetFormat = {};
            }
            temp.data.targetFormat.name = format.name;
            temp.data.targetFormat.id = format._id;
            temp.data.targetFormat.attributeCount = format.attributeCount;
            temp.data.targetFormat.type = 'dataService';
            temp.data.targetFormat.formatType = 'JSON';
        } else {
            temp.data.source = self.appService.randomID(5);
            temp.data.sourceFormat = format.in;
            temp.data.target = self.appService.randomID(5);
            temp.data.targetFormat = format.out;
            if (!temp.data.meta.connectionDetails) {
                temp.data.meta.connectionDetails = {};
            }
            temp.data.meta.contentType = format.in.formatType;
            temp.data.meta.connectionDetails.url = format.url;
            temp.data.meta.connectionDetails.connectionType = 'PLAIN';
        }
        temp.data.meta.customHeadersList = format.headers;
        if (temp.data.meta.customHeadersList && temp.data.meta.customHeadersList.length > 0) {
            temp.data.meta.customHeadersList.forEach(item => {
                item.checked = true;
            });
        }
        if (temp.data.sourceFormat && temp.data.sourceFormat.id && temp.data.sourceFormat.type !== 'custom') {
            self.getFormatDetails(temp.data.sourceFormat).then(res => {
                self.reBuildDefinition(temp.data, 'sourceFormat');
            }, err => { });
        }
        if (temp.data.targetFormat && temp.data.targetFormat.id && temp.data.targetFormat.type !== 'custom') {
            self.getFormatDetails(temp.data.targetFormat).then(res => {
                self.reBuildDefinition(temp.data, 'targetFormat');
            }, err => { });
        }
        self.formatList = [];
    }

    getFormatDetails(data: Format): Promise<any> {
        const self = this;
        const options: GetOptions = {
            select: 'name,attributeCount,definition'
        };
        let request;
        if (data.type === 'dataService') {
            request = self.commonService.get('serviceManager', '/service/' + data.id, options);
        } else {
            request = self.commonService.get('partnerManager', '/dataFormat/' + data.id, options);
        }
        return new Promise((resolve, reject) => {
            self.subscriptions['getFormatDetails_' + data.id] = request.subscribe(res => {
                data.name = res.name;
                data.attributeCount = res.attributeCount;
                if (data.type === 'dataService') {
                    data.definition = JSON.parse(res.definition);
                } else {
                    data.definition = JSON.parse(res.definition).definition;
                }
                resolve(data);
            }, err => {
                self.commonService.errorToast(err);
                reject(err);
            });
        });
    }

    getAgents() {
        const self = this;
        const options: GetOptions = {
            select: 'name,agentID,type',
            filter: {
                name: {
                    $exists: true
                },
                app: self.commonService.app._id
            },
            count: -1,
            noApp: true
        };
        self.subscriptions['getAgents'] = self.commonService.get('partnerManager', '/agentRegistry', options).subscribe(res => {
            self.agentList = res;
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    setFormat(format: any) {
        const self = this;
        format.id = format._id;
        delete format._id;
        const temp = self.selectedNode;
        if (format.formatType === 'EXCEL') {
            temp.data.meta.fileDetails = {
                excelType: format.excelType
            };
        }
        if (format.formatType === 'DELIMITER') {
            temp.data.meta.character = format.character;
        }
        if (format.formatType === 'CSV') {
            temp.data.meta.character = ',';
        }
        if (!format.formatType) {
            format.formatType = 'JSON';
            temp.data.meta.contentType = 'JSON';
        } else {
            temp.data.meta.contentType = format.formatType;
        }
        const tempId = self.appService.randomID(5);
        temp.data.source = tempId;
        temp.data.sourceFormat = format;
        temp.data.target = tempId;
        temp.data.targetFormat = format;
        if (temp.data.targetFormat.type !== 'custom' && temp.data.targetFormat.type !== 'binary') {
            self.getFormatDetails(temp.data.targetFormat).then(res => {
                self.reBuildDefinition(temp.data, 'targetFormat');
            }, err => { });
        }
        if (temp.data.sourceFormat.type !== 'custom' && temp.data.sourceFormat.type !== 'binary') {
            self.getFormatDetails(temp.data.sourceFormat).then(res => {
                self.reBuildDefinition(temp.data, 'sourceFormat');
            }, err => { });
        }
    }

    removeFormat() {
        const self = this;
        const temp = self.selectedNode;
        temp.data.source = null;
        temp.data.sourceFormat = null;
        temp.data.target = null;
        temp.data.targetFormat = null;
        temp.data.meta.xslt = null;
        temp.data.mapping = null;
        delete temp.data.meta.contentType;
    }

    mapperInvalid(index: number) {
        const self = this;
        if (index === 0) {
            return;
        }
        const left = self.items[index - 1];
        const right = self.items[index];
        if (left.data.meta.contentType === 'BINARY' || right.data.meta.contentType === 'BINARY') {
            return false;
        } else {
            if (left.data.target && right.data.source) {
                if (left.data.target === right.data.source && !right.data.meta.xslt) {
                    return false;
                } else if (!right.data.meta.xslt) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        }
    }

    addCircle(index: number, data?: NodeData) {
        const self = this;
        const temp: SVGData = {
            type: 'circle',
            cx: this.windowWidth / 2 + (248 * self.items.length),
            cy: this.windowHeight / 2,
            r: 24,
            data: data ? data : {
                meta: {
                    wsdlType: 'url',
                    blockType: 'INPUT',
                    sourceType: 'FILE',
                    targetType: 'FILE',
                    character: ',',
                    fileDetails: {},
                    connectionDetails: {
                        // sslType: 'ONE-WAY',
                        // connectionType: 'CERTIFICATE-KEY'
                        connectionType: 'PLAIN'
                    },
                    uniqueRemoteTransactionOptions: {}
                }
            }
        };
        if (self.data.direction === 'Inbound') {
            temp.data.meta.source = self.agentId;
        }
        self.items.push(temp);
        self.panX = 0;
    }

    addHexagon(index: number, data?: NodeData) {
        const self = this;
        if (self.hasPermission('PVPFMB') && !self.hasPermissionStartsWith('PMPFM')) {
            return;
        }
        const x = this.windowWidth / 2 + (224 * self.items.length);
        const y = this.windowHeight / 2 - 24;
        // 24, 0 0, 12 0, 36 24, 48 48, 36 48, 12
        if (self.items[index]) {
            self.items[index].addNew = false;
        }
        const temp = {
            type: 'hexagon',
            cx: this.windowWidth / 2 + (224 * self.items.length),
            cy: this.windowHeight / 2,
            points: `${x},${y} ${x - 24},${y + 13} ${x - 24},${y + 35} ${x},${y + 48} ${x + 24},${y + 35} ${x + 24},${y + 13}`,
            data: data ? data : {
                meta: {
                    blockType: 'PROCESS',
                    processType: 'REQUEST',
                    formatType: 'nanoService',
                    connectionDetails: {
                        connectionType: 'PLAIN',
                        trustAllCerts: false
                    }
                }
            }
        };
        if (index + 1 < self.items.length) {
            const t1 = self.items[index + 1];
            t1.data.mapping = [];
            t1.data.meta.xslt = {};
        }
        if (index !== undefined) {
            self.items.splice(index + 1, 0, temp);
        } else {
            self.items.push(temp);
        }
        self.panX = 244 * (self.items.length - index - 1);
        // self.selectItem(temp);
        self.reCalculateCorrdinates(temp);
    }

    addSquare(index: number, data?: NodeData) {
        const self = this;
        if (self.hasPermission('PVPFMB') && !self.hasPermissionStartsWith('PMPFM')) {
            return;
        }
        const x = self.windowWidth / 2 + (224 * self.items.length);
        const y = self.windowHeight / 2;
        if (self.items[index]) {
            self.items[index].addNew = false;
        }
        self.flowEnded = index + 1;
        const temp: SVGData = {
            type: 'square',
            x1: x - 24,
            y1: y - 24,
            cx: x,
            cy: y,
            width: 48,
            height: 48,
            data: data ? data : {
                meta: {
                    wsdlType: 'url',
                    blockType: 'OUTPUT',
                    sourceType: 'FILE',
                    targetType: 'FILE',
                    character: ',',
                    connectionDetails: {
                        connectionType: 'PLAIN',
                        trustAllCerts: false
                    },
                }
            }
        };
        if (!data && self.items.length === 1) {
            const inputNode = self.items[0];
            temp.data.meta.sourceType = inputNode.data.meta.sourceType;
            temp.data.meta.targetType = inputNode.data.meta.sourceType;
        }
        if (!data && self.data.direction === 'Outbound') {
            temp.data.meta.target = self.agentId;
        }
        self.items.push(temp);
        self.panX = 244 * (self.items.length - index - 1);
        self.selectItem(temp);
    }

    changeDirection() {
        const self = this;
        const input = self.items.find(e => e.data.meta.blockType === 'INPUT' && e.data.meta.sourceType === 'FILE');
        const output = self.items.find(e => e.data.meta.blockType === 'OUTPUT' && e.data.meta.targetType === 'FILE');
        if (self.data.direction === 'Inbound') {
            if (input) {
                input.data.meta.source = self.agentId;
                input.data.meta.target = self.agentId;
            }
            if (output) {
                output.data.meta.source = null;
                output.data.meta.target = null;
            }
        } else {
            if (input) {
                input.data.meta.source = null;
                input.data.meta.target = null;
            }
            if (output) {
                output.data.meta.source = self.agentId;
                output.data.meta.target = self.agentId;
            }
        }
    }


    reCalculateCorrdinates(selected?: SVGData) {
        const self = this;
        self.items.forEach((item, index) => {
            if (item.type === 'square') {
                const x = self.windowWidth / 2 + (224 * (index));
                item.x1 = x - 24;
                item.cx = x;
            } else if (item.type === 'hexagon') {
                const x = self.windowWidth / 2 + (224 * (index));
                const y = self.windowHeight / 2 - 24;
                item.cx = self.windowWidth / 2 + (224 * (index));
                item.points = `${x},${y} ${x - 24},${y + 13} ${x - 24},${y + 35} ${x},${y + 48} ${x + 24},${y + 35} ${x + 24},${y + 13}`;
            }
        });
        self.flowEnded = self.items.findIndex(e => e.type === 'square');
        if (selected) {
            self.selectItem(selected);
        } else {
            self.selectItem(self.items[0]);
        }
    }

    calibrateWindowDimension() {
        const self = this;
        const rect: ClientRect = self.designCanvas.getBoundingClientRect();
        self.windowHeight = rect.height;
        self.windowWidth = rect.width;
    }

    drawGrid() {
        const self = this;
        const group: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGElement;
        group.setAttribute('id', 'grid');
        // group.setAttribute('fill', 'rgba(204,230,244,0.32)');
        const rect: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
        rect.setAttribute('x', `0`);
        rect.setAttribute('y', `-8`);
        rect.setAttribute('width', `${self.windowWidth * 100}`);
        rect.setAttribute('height', `${self.windowHeight * 100}`);
        rect.setAttribute('fill', `rgba(204,230,244,0.32)`);
        group.appendChild(rect);
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                const distX = ((50) * j) + 10;
                const distY = ((50) * i) + 10;
                const ele: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle') as SVGElement;
                ele.setAttribute('cx', `${distX}`);
                ele.setAttribute('cy', `${distY}`);
                ele.setAttribute('r', `2`);
                ele.setAttribute('fill', `#CCE6F4`);
                group.appendChild(ele);
            }
        }
        self.designCanvas.insertBefore(group, self.designCanvas.children[0]);
    }

    getItems(): Array<SVGData> {
        const self = this;
        return [
            {
                type: 'circle',
                x1: self.windowWidth / 2,
                y1: self.windowHeight / 2,
                cx: self.windowWidth / 2,
                cy: self.windowHeight / 2,
                r: 20,
                selected: true,
                data: {
                    meta: {
                        wsdlType: 'url',
                        blockType: 'INPUT',
                        sourceType: 'FILE',
                        character: ',',
                        fileDetails: {},
                        connectionDetails: {},
                        source: self.agentId,
                        uniqueRemoteTransactionOptions: {}
                    }
                }
            }
        ];
    }

    getPolygonPoints(x: number, y: number, size: number) {
        const self = this;
        return `${x},${y}
         ${x - size / 2},${y + size / 4}
          ${x - size / 2},${y + (size / 4 * 3)}
           ${x},${y + size}
            ${x + size / 2},${y + (size / 4 * 3)}
             ${x + size / 2},${y + size / 4}`;
    }

    getTrianglePoints(x: number, y: number, size: number) {
        const self = this;
        return `${x},${y}
         ${x - size},${y + size}
          ${x + size},${y + size}`;
    }

    onMousedown(event: MouseEvent) {
        const self = this;
        self.mouseDown = true;
    }

    zoom(amount: number) {
        const self = this;
        self.zoomFactor += amount;
    }

    pan(event: MouseEvent) {
        const self = this;
        if (self.mouseDown) {
            self.panX += event.movementX;
        }
        if (self.panX > (248 * this.items.length)) {
            self.panX = (248 * this.items.length);
        }
    }

    modalController() {
        const self = this;
        if (self.selectWSDLOperationTemplateRef) {
            self.selectWSDLOperationTemplateRef.result.then(close => { }, dismiss => { });
        }
    }

    wsdlContent(data) {
        const self = this;
        const temp = self.selectedNode;
        temp.data.meta.wsdlContent = data;
        if (data) {
            self.getWSDLOperations().then(res => {
                self.selectWSDLOperationTemplateRef = self.commonService.modal(self.selectWSDLOperationTemplate);
                self.modalController();
            }).catch(err => {
                self.commonService.errorToast(err);
            });
        }
    }

    getWSDLOperations() {
        const self = this;
        const temp = self.selectedNode;
        self.showLazyLoader = true;
        return self.commonService.post('b2b', '/WSDLOperationsList', {
            wsdlContent: temp.data.meta.wsdlContent
        }).pipe(
            map(data => {
                self.wsdlOperations = data;
                self.showLazyLoader = false;
                return data;
            }),
            catchError(err => {
                self.showLazyLoader = false;
                return err;
            })
        ).toPromise();
    }

    getWDSLStructure(res: any) {
        const self = this;
        const temp = self.selectedNode;
        self.showLazyLoader = true;
        return self.commonService.post('b2b', '/WSDLStructure', res).pipe(
            map(data => {
                self.showLazyLoader = false;
                return data;
            }),
            catchError(err => {
                self.showLazyLoader = false;
                return err;
            })
        ).toPromise();
    }

    selectWSDLOperation(operation: string, portType: string, bindingName: string) {
        const self = this;
        self.selectWSDLOperationTemplateRef.close(false);
        const temp = self.selectedNode;
        temp.data.meta.operation = operation;
        self.getWDSLStructure({
            operation,
            portType,
            bindingName,
            wsdlContent: temp.data.meta.wsdlContent,
            contentType: temp.data.meta.contentType
        }).then(res => {
            const format = {
                _id: self.appService.randomID(5),
                name: 'custom',
                definition: res.inputStructure,
                type: 'custom',
                attributeCount: self.schemaService.countAttr(JSON.parse(res.inputStructure)),
                formatType: temp.data.meta.contentType
            };
            temp.data.meta.inputName = res.inputName;
            temp.data.meta.inputType = res.inputType;
            self.setFormat(format);
        }).catch(err => {
            self.commonService.errorToast(err);
        });
    }

    addNewHeader() {
        const self = this;
        if (!self.selectedNode.data.meta.customHeadersList) {
            self.selectedNode.data.meta.customHeadersList = [];
        }
        self.selectedNode.data.meta.customHeadersList.push({
            header: null,
            key: null,
            value: null,
            new: true,
            checked: true
        });
    }

    headerKeyChange(item, value) {
        const self = this;
        item.key = value;
        if (self.selectedNode.data.meta.blockType === 'INPUT' || self.selectedNode.data.meta.blockType === 'OUTPUT') {
            item.header = self.convertHeader('ODP-F-', item.key);
        } else if (self.selectedNode.data.meta.formatType === 'nanoService') {
            item.header = self.convertHeader('ODP-NS-', item.key);
        } else {
            item.header = self.convertHeader('ODP-DS-', item.key);
        }
        self.headerToggle();
    }

    reBuildDefinition(data: NodeData, type: string) {
        const self = this;
        if (!data[type].definition) {
            data[type].definition = {};
        }
        if (typeof data[type].definition === 'string') {
            data[type].definition = JSON.parse(data[type].definition);
        }
        const headers = self
            .convertHeadersToDefinition(data.meta.customHeadersList);
        if (headers) {
            data[type].definition['$headers'] = headers;
        } else {
            delete data[type].definition['$headers'];
        }
    }

    removeHeader(index: number) {
        const self = this;
        self.selectedNode.data.meta.customHeadersList.splice(index, 1);
        if (self.leftXSLT) {
            const temp = self.leftXSLT;
            temp.data.meta.xslt = null;
            temp.data.mapping = null;
        }
        if (self.rightXSLT) {
            const temp = self.rightXSLT;
            temp.data.meta.xslt = null;
            temp.data.mapping = null;
        }
        self.headerToggle();
    }

    headerToggle() {
        const self = this;
        const headers = self
            .convertHeadersToDefinition(self.selectedNode.data.meta.customHeadersList);
        if (headers) {
            if (!self.selectedNode.data.sourceFormat.definition) {
                self.selectedNode.data.sourceFormat.definition = {};
            }
            if (!self.selectedNode.data.targetFormat.definition) {
                self.selectedNode.data.targetFormat.definition = {};
            }
            if (typeof self.selectedNode.data.sourceFormat.definition === 'string') {
                self.selectedNode.data.sourceFormat.definition = JSON.parse(self.selectedNode.data.sourceFormat.definition);
            }
            if (typeof self.selectedNode.data.targetFormat.definition === 'string') {
                self.selectedNode.data.targetFormat.definition = JSON.parse(self.selectedNode.data.targetFormat.definition);
            }
            self.selectedNode.data.sourceFormat.definition['$headers'] = headers;
            self.selectedNode.data.targetFormat.definition['$headers'] = headers;
        } else {
            delete self.selectedNode.data.sourceFormat.definition['$headers'];
            delete self.selectedNode.data.targetFormat.definition['$headers'];
        }
        self.removeMapping();
    }

    removeMapping() {
        const self = this;
        if (self.leftXSLT) {
            const temp = self.leftXSLT;
            temp.data.meta.xslt = null;
            temp.data.mapping = null;
        }
        if (self.rightXSLT) {
            const temp = self.rightXSLT;
            temp.data.meta.xslt = null;
            temp.data.mapping = null;
        }
    }

    convertHeader(prefix: string, key: string) {
        if (key) {
            return prefix + key.split(' ')
                .filter(e => e)
                .map(e => e.charAt(0).toUpperCase() + e.substr(1, e.length))
                .join('-');
        }
        return null;
    }

    getHeaders(headerList: Array<any>) {
        const self = this;
        const headers = {};
        headerList.forEach(e => {
            if (!e.header) {
                e.header = self.convertHeader('ODP-NS-', e.key);
            }
        });
        const selectedHeaders = headerList.filter(e => e.checked);
        selectedHeaders.forEach(e => {
            headers[e.header] = e.value;
        });
        return headers;
    }

    formatDirectoryUrl(key: string) {
        const self = this;
        const temp = self.selectedNode;
        let path: string = temp.data.meta[key];
        if (path) {
            if (!path.startsWith('./') && !path.startsWith('../')) {
                if (path.startsWith('/')) {
                    temp.data.meta[key] = '.' + path;
                } else {
                    temp.data.meta[key] = './' + path;
                }
            }
            path = temp.data.meta[key];
            if (path.endsWith('/')) {
                temp.data.meta[key] = path.substr(0, path.length - 1);
            }
        }
    }

    configureSSLSettings() {
        const self = this;
        const temp = self.selectedNode;
        if (temp) {
            if (temp.data.meta.connectionDetails.trustAllCerts) {
                temp.data.meta.secretIds = [];
                if (self.twoWaySSL) {
                    temp.data.meta.connectionDetails.connectionType = 'CERTIFICATE-KEY';
                    temp.data.meta.connectionDetails.sslType = 'TWO-WAY';
                } else {
                    temp.data.meta.connectionDetails.connectionType = 'CERTIFICATE-KEY';
                    temp.data.meta.connectionDetails.sslType = 'ONE-WAY';
                }
            } else {
                if (self.validateServerIdentity || self.validateClientIdentity) {
                    if (self.twoWaySSL) {
                        temp.data.meta.connectionDetails.connectionType = 'CERTIFICATE-KEY';
                        temp.data.meta.connectionDetails.sslType = 'TWO-WAY';
                    } else {
                        temp.data.meta.connectionDetails.connectionType = 'CERTIFICATE-KEY';
                        temp.data.meta.connectionDetails.sslType = 'ONE-WAY';
                    }
                } else {
                    temp.data.meta.secretIds = [];
                    if (self.twoWaySSL) {
                        temp.data.meta.connectionDetails.connectionType = 'CERTIFICATE-KEY';
                        temp.data.meta.connectionDetails.sslType = 'TWO-WAY';
                    } else {
                        temp.data.meta.connectionDetails.connectionType = 'PLAIN';
                        temp.data.meta.connectionDetails.sslType = null;
                    }
                }
            }
        }
    }

    clearAll() {
        const self = this;
        self.alertModal.statusChange = false;
        self.alertModal.title = 'Clear All';
        self.alertModal.message = `Are you sure you want to clear all nodes.?`;
        self.openDeleteModal.emit(self.alertModal);
    }

    closeDeleteModal(data) {
        if (data) {
            const self = this;
            const temp: NodeData = self.data.blocks.find(e => e.meta.blockType === 'INPUT');
            temp.source = null;
            temp.sourceFormat = {};
            temp.target = null;
            temp.targetFormat = {};
            self.items = [];
            self.addCircle(0, temp);
            self.panX = 244 * (self.items.length - 1);
            self.reCalculateCorrdinates();
        }
    }

    selectAgent(data: any, type: string) {
        const self = this;
        if (data && data.item) {
            self.selectedNode.data.meta[type] = data.item.agentID;
        }
    }

    deSelectNode(event: MouseEvent) {
        const self = this;
        let flag = false;
        const target: HTMLElement = event.target as HTMLElement;
        const nodeList: NodeListOf<HTMLElement> = document.querySelectorAll('.microflow-node');
        if (nodeList && nodeList.length > 0) {
            for (let i = 0; i < nodeList.length; i++) {
                const node = nodeList.item(i);
                if (node.contains(target)) {
                    flag = true;
                    break;
                }
            }
        }
        if (!flag) {
            self.items.forEach(e => {
                e.selected = false;
                e.addNew = false;
            });
        }
    }

    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            map(term => term === '' ? []
                : this.appAgents.filter(e => e.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
        )

    inputFormatter = (x: any) => {
        const self = this;
        if (self.appAgents && self.appAgents.length > 0) {
            const temp = self.appAgents.find(e => e.agentID === x);
            return temp ? temp.name : null;
        }
        return null;
    }

    resultFormatter = (x: { name: string }) => x.name;

    convertHeadersToDefinition(headersList: Array<any>) {
        const self = this;
        if (headersList && headersList.length > 0) {
            const definition = {
                type: 'Object',
                properties: {
                    name: 'Headers',
                    dataKey: '$headers'
                },
                definition: {}
            };
            headersList.filter(e => e.checked).forEach(item => {
                definition.definition[self.appService.toCamelCase(item.header)] = {
                    type: 'String',
                    properties: {
                        name: item.header,
                        dataKey: item.header
                    }
                };
            });
            return definition;
        }
        return null;
    }

    blockNameChange(event: any, value?: string) {
        const self = this;
        if (event) {
            event.target.value = self.selectedNode.data.name;
        } else {
            if (value) {
                value = value.substr(0, 48);
            }
            self.selectedNode.data.name = value;
        }
    }

    addInputDirectory(directoryEle: HTMLInputElement) {
        const self = this;
        let directory = directoryEle.value;
        directoryEle.value = '';
        if (!self.selectedNode.data.meta.inputDirectories) {
            self.selectedNode.data.meta.inputDirectories = [];
        }
        if (!directory || !directory.trim()) {
            return;
        }
        if (!directory.startsWith('./') && !directory.startsWith('../')) {
            if (directory.startsWith('/')) {
                directory = '.' + directory;
            } else {
                directory = './' + directory;
            }
        }
        if (directory.endsWith('/')) {
            directory = directory.substr(0, directory.length - 1);
        }
        if (self.selectedNode.data.meta.inputDirectories.findIndex(e => e.path === directory) > -1) {
            return;
        }
        self.selectedNode.data.meta.inputDirectories.push({
            path: directory,
            watchSubDirectories: false
        });
    }

    removeInputDirectory(index: number) {
        const self = this;
        if (!self.selectedNode.data.meta.inputDirectories) {
            self.selectedNode.data.meta.inputDirectories = [];
        }
        self.selectedNode.data.meta.inputDirectories.splice(index, 1);
    }

    addOutputDirectory(directoryEle: HTMLInputElement) {
        const self = this;
        let directory = directoryEle.value;
        directoryEle.value = '';
        if (!self.selectedNode.data.meta.outputDirectories) {
            self.selectedNode.data.meta.outputDirectories = [];
        }
        if (!directory || !directory.trim()) {
            return;
        }
        if (!directory.startsWith('./') && !directory.startsWith('../')) {
            if (directory.startsWith('/')) {
                directory = '.' + directory;
            } else {
                directory = './' + directory;
            }
        }
        if (directory.endsWith('/')) {
            directory = directory.substr(0, directory.length - 1);
        }
        if (self.selectedNode.data.meta.outputDirectories.findIndex(e => e.path === directory) > -1) {
            return;
        }
        self.selectedNode.data.meta.outputDirectories.push({
            path: directory
        });
    }

    removeOutputDirectory(index: number) {
        const self = this;
        if (!self.selectedNode.data.meta.outputDirectories) {
            self.selectedNode.data.meta.outputDirectories = [];
        }
        self.selectedNode.data.meta.outputDirectories.splice(index, 1);
    }

    addCustomExtention(extentionEle: HTMLInputElement) {
        const self = this;
        let extention = extentionEle.value;
        extentionEle.value = '';
        if (!self.selectedNode.data.meta.fileExtensions) {
            self.selectedNode.data.meta.fileExtensions = [];
        }
        if (!extention || !extention.trim()) {
            return;
        }
        if (extention.startsWith('.')) {
            extention = extention.substr(1, extention.length);
        }
        if (self.selectedNode.data.meta.fileExtensions.findIndex(e => e.extension === extention) > -1) {
            return;
        }
        let custom = true;
        if (self.fileExtentionList.findIndex(e => e === extention) > -1) {
            custom = false;
        }
        self.selectedNode.data.meta.fileExtensions.push({
            custom,
            extension: extention
        });
    }

    removeCustomExtention(extention: string) {
        const self = this;
        if (!self.selectedNode.data.meta.fileExtensions) {
            self.selectedNode.data.meta.fileExtensions = [];
        }
        const index = self.selectedNode.data.meta.fileExtensions.findIndex(e => e.extension === extention);
        if (index > -1) {
            self.selectedNode.data.meta.fileExtensions.splice(index, 1);
        }
    }

    addIpList(ipListEle: HTMLInputElement) {
        const self = this;
        const ip = ipListEle.value;
        ipListEle.value = '';
        if (!self.selectedNode.data.meta.fileExtensions) {
            self.selectedNode.data.meta.fileExtensions = [];
        }
        if (!ip || !ip.trim()) {
            return;
        }
        if (self.selectedNode.data.meta.ipList.findIndex(e => e === ip) > -1) {
            return;
        }
        self.selectedNode.data.meta.ipList.push(ip);
    }

    removeIpList(index: number) {
        const self = this;
        if (!self.selectedNode.data.meta.ipList) {
            self.selectedNode.data.meta.ipList = [];
        }
        self.selectedNode.data.meta.ipList.splice(index, 1);
    }

    addFilePattern(patternEle: HTMLInputElement) {
        const self = this;
        const pattern = patternEle.value;
        patternEle.value = '';
        if (!self.selectedNode.data.meta.fileNameRegexs) {
            self.selectedNode.data.meta.fileNameRegexs = [];
        }
        if (!pattern || !pattern.trim()) {
            return;
        }
        if (self.selectedNode.data.meta.fileNameRegexs.findIndex(e => e === pattern) > -1) {
            return;
        }
        self.selectedNode.data.meta.fileNameRegexs.push(pattern);
    }

    removeFilePattern(pattern: string) {
        const self = this;
        if (!self.selectedNode.data.meta.fileNameRegexs) {
            self.selectedNode.data.meta.fileNameRegexs = [];
        }
        const index = self.selectedNode.data.meta.fileNameRegexs.findIndex(e => e === pattern);
        if (index > -1) {
            self.selectedNode.data.meta.fileNameRegexs.splice(index, 1);
        }
    }

    setFileExtention(checked: boolean, ext: string) {
        const self = this;
        const exts = self.selectedNode.data.meta.fileExtensions || [];
        const index = exts.findIndex(e => e.extension === ext);
        if (checked) {
            exts.push({
                custom: false,
                extension: ext
            });
        } else {
            exts.splice(index, 1);
        }
        self.selectedNode.data.meta.fileExtensions = exts;
    }

    getFileExtention(ext: string) {
        const self = this;
        const exts = self.selectedNode.data.meta.fileExtensions || [];
        const index = exts.findIndex(e => e.extension === ext);
        if (index > -1) {
            return true;
        }
        return false;
    }

    get inputDirectories() {
        const self = this;
        if (self.selectedNode
            && self.selectedNode.data
            && self.selectedNode.data.meta
            && self.selectedNode.data.meta.inputDirectories) {
            return self.selectedNode.data.meta.inputDirectories;
        }
        return [];
    }

    get outputDirectories() {
        const self = this;
        if (self.selectedNode
            && self.selectedNode.data
            && self.selectedNode.data.meta
            && self.selectedNode.data.meta.outputDirectories) {
            return self.selectedNode.data.meta.outputDirectories;
        }
        return [];
    }

    get customExtensions() {
        const self = this;
        if (self.selectedNode
            && self.selectedNode.data
            && self.selectedNode.data.meta
            && self.selectedNode.data.meta.fileExtensions) {
            return self.selectedNode.data.meta.fileExtensions.filter(e => e.custom);
        }
        return [];
    }

    get ipList() {
        const self = this;
        if (self.selectedNode
            && self.selectedNode.data
            && self.selectedNode.data.meta
            && self.selectedNode.data.meta.ipList) {
            return self.selectedNode.data.meta.ipList;
        }
        return [];
    }

    get filePatterns() {
        const self = this;
        if (self.selectedNode
            && self.selectedNode.data
            && self.selectedNode.data.meta
            && self.selectedNode.data.meta.fileNameRegexs) {
            return self.selectedNode.data.meta.fileNameRegexs;
        }
        return [];
    }

    get changesDone() {
        const self = this;
        if (JSON.stringify(self.oldValue) !== JSON.stringify(self.items)) {
            return true;
        }
        return false;
    }

    get partnerId() {
        const self = this;
        if (self.partner && self.partner.get('_id')) {
            return self.partner.get('_id').value;
        }
        return null;
    }

    get agentId() {
        const self = this;
        if (self.partner && self.partner.get('agentID')) {
            return self.partner.get('agentID').value;
        }
        return null;
    }


    get restrictToFormat() {
        const self = this;
        const temp = self.selectedNode;
        if (temp.data.meta.blockType === 'INPUT') {
            if (temp.data.meta.sourceType === 'REST') {
                return ['JSON', 'XML'];
            } else if (temp.data.meta.sourceType === 'SOAP') {
                return ['XML', 'WSDL-XML', 'JAXRPC-XML'];
            } else {
                return ['JSON', 'XML', 'CSV', 'EXCEL', 'DELIMITER', 'FLATFILE', 'BINARY'];
            }
        } else {
            if (temp.data.meta.targetType === 'REST') {
                return ['JSON', 'XML', 'BINARY'];
            } else if (temp.data.meta.targetType === 'SOAP') {
                return ['XML', 'WSDL-XML', 'JAXRPC-XML'];
            } else {
                return ['JSON', 'XML', 'CSV', 'EXCEL', 'DELIMITER', 'FLATFILE', 'BINARY'];
            }
        }
        return [];
    }

    get hasHttps() {
        const self = this;
        const temp = self.selectedNode;
        if (temp && temp.data.meta.connectionDetails.url) {
            return temp.data.meta.connectionDetails.url.startsWith('https:');
        }
        return false;
    }

    get trustAllCerts() {
        const self = this;
        const temp = self.selectedNode;
        if (temp && temp.data.meta.connectionDetails.trustAllCerts) {
            return true;
        } else {
            return false;
        }
    }

    set trustAllCerts(val) {
        const self = this;
        const temp = self.selectedNode;
        if (temp) {
            temp.data.meta.connectionDetails.trustAllCerts = val;
            self.configureSSLSettings();
        }
    }

    get validateServerIdentity() {
        const self = this;
        const temp = self.selectedNode;
        if (temp && temp.data.meta.connectionDetails.validateServerIdentity) {
            return true;
        } else {
            return false;
        }
    }

    set validateServerIdentity(val) {
        const self = this;
        const temp = self.selectedNode;
        if (temp) {
            temp.data.meta.connectionDetails.validateServerIdentity = val;
            self.configureSSLSettings();
        }
    }


    get validateClientIdentity() {
        const self = this;
        const temp = self.selectedNode;
        if (temp && temp.data.meta.connectionDetails.validateClientIdentity) {
            return true;
        } else {
            return false;
        }
    }

    set validateClientIdentity(val) {
        const self = this;
        const temp = self.selectedNode;
        if (temp) {
            temp.data.meta.connectionDetails.validateClientIdentity = val;
            self.configureSSLSettings();
        }
    }

    get twoWaySSL() {
        const self = this;
        const temp = self.selectedNode;
        if (temp && temp.data.meta.connectionDetails.twoWaySSL) {
            return true;
        } else {
            return false;
        }
    }
    set twoWaySSL(val) {
        const self = this;
        const temp = self.selectedNode;
        if (temp) {
            temp.data.meta.connectionDetails.twoWaySSL = val;
            self.configureSSLSettings();
        }
    }

    get ipWhitelistEnabled() {
        const self = this;
        const temp = self.selectedNode;
        if (temp && temp.data.meta.ipWhitelistEnabled) {
            return true;
        } else {
            return false;
        }
    }
    set ipWhitelistEnabled(val) {
        const self = this;
        const temp = self.selectedNode;
        if (temp) {
            temp.data.meta.ipWhitelistEnabled = val;
            if (!val) {
                temp.data.meta.ipList = [];
            }
        }
    }

    get invalidFlow() {
        const self = this;
        return self.appService.isInvalidFlow(self.items.map(e => e.data));
    }

    get certificates() {
        const self = this;
        if (self.partner.get('secrets') && self.partner.get('secrets').value) {
            return self.partner.get('secrets').value.filter(e => e.type === 'certificate');
        }
        return [];
    }

    get textBoxStyle() {
        const self = this;
        return {
            top: ((self.selectedNode ? self.selectedNode.cy : 0) + 85 + ((this.zoomFactor - 1) * 200)) + 'px',
            left: ((self.selectedNode ? self.selectedNode.cx : 0) - self.start - 80) + 'px',
            'min-width': '160px',
            'max-width': '160px',
            'min-height': '28px',
            'max-height': '28px',
        };
    }

    get dropdownStyle() {
        const self = this;
        return {
            top: ((self.selectedNode ? self.selectedNode.cy : 0) + 55 + ((this.zoomFactor - 1) * 200)) + 'px',
            left: ((self.selectedNode ? self.selectedNode.cx : 0) - self.start - 80) + 'px',
            'min-width': '160px',
            'max-width': '160px',
            'min-height': '28px',
            'max-height': '28px',
        };
    }


    get viewBox() {
        return `${this.start < 0 ? 0 : this.start} `
            + `${-(this.zoomFactor - 1) * 200} ${this.windowWidth} ${this.windowHeight * this.zoomFactor}`;
    }

    get minimapViewBox() {
        return `0 0 ${this.windowWidth * 4} 36`;
    }

    get minimapY() {
        if (this.windowHeight) {
            return -((this.windowHeight / 2) - 20);
        }
        return null;
    }

    get start() {
        return (248 * this.items.length) - this.panX;
    }
    get coverWidth() {
        const width = this.start / 4.8 + 248;
        return {
            minWidth: width + 'px'
        };
    }

    get selectedNode() {
        const self = this;
        return self.items.find(e => e.selected);
    }

    get mapperLeft() {
        const self = this;
        const index = self.items.findIndex(e => e.selected);
        if (index === 0) {
            return null;
        } else {
            return self.items[index - 1];
        }
    }

    get mapperRight() {
        const self = this;
        return self.items.find(e => e.selected);
    }

    get leftXSLT() {
        const self = this;
        return self.items.find(e => e.selected);
    }

    get rightXSLT() {
        const self = this;
        const index = self.items.findIndex(e => e.selected);
        if (index === self.items.length - 1) {
            return null;
        } else {
            return self.items[index + 1];
        }
    }

    get appAgents() {
        const self = this;
        return self.agentList.filter(e => e.type === 'APPAGENT');
    }

    get partnerAgents() {
        const self = this;
        return self.agentList.filter(e => e.type === 'PARTNERAGENT');
    }

    get flowPending() {
        const self = this;
        if (self.partner && self.partner.get('status')) {
            return self.partner.get('status').value;
        }
        return null;
    }

    get isValidURL() {
        const self = this;
        const temp = self.selectedNode;
        if (temp && (temp.data.meta.formatType === 'nanoService'
            || (temp.data.meta.blockType === 'OUTPUT' && temp.data.meta.targetType === 'REST'))) {
            if (temp.data.meta.connectionDetails.url
                && self.appService.isValidURL(temp.data.meta.connectionDetails.url)) {
                return true;
            }
            return false;
        }
        return true;
    }

    get isValidService() {
        const self = this;
        if (self.mapperLeft && self.mapperRight
            && self.mapperLeft.data.targetFormat
            && self.mapperLeft.data.targetFormat.id
            && self.mapperRight.data.sourceFormat
            && self.mapperRight.data.sourceFormat.id) {
            return true;
        }
        if (self.mapperLeft.data.meta.contentType === 'BINARY'
            || self.mapperRight.data.meta.contentType === 'BINARY') {
            return true;
        }
        return false;
    }

    get agentNotSelected() {
        const self = this;
        const temp = self.selectedNode;
        if (temp && temp.data.meta.blockType === 'OUTPUT'
            && temp.data.meta.targetType === 'FILE'
            && !temp.data.meta.target) {
            return true;
        }
        return false;
    }

    get showMapper() {
        const self = this;
        if (self.mapperLeft && self.mapperRight
            && self.mapperLeft.data.meta.blockType === 'INPUT'
            && self.mapperLeft.data.meta.sourceType === 'FILE'
            && self.mapperRight.data.sourceFormat.type === 'binary') {
            return false;
        }
        return true;
    }

    hasPermission(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermission(type, entity);
    }

    hasPermissionStartsWith(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermissionStartsWith(type, entity);
    }
}

export interface SVGData {
    type?: string;
    x1?: number;
    x2?: number;
    y1?: number;
    y2?: number;
    cx?: number;
    cy?: number;
    r?: number;
    width?: number;
    height?: number;
    points?: string;
    style?: any;
    selected?: boolean;
    addNew?: boolean;
    data?: NodeData;
}

export interface NodeData {
    name?: string;
    description?: string;
    id?: string;
    meta?: MetaData;
    source?: string;
    target?: string;
    sourceFormat?: Format;
    targetFormat?: Format;
    mapping?: Array<any>;
    formatId?: string;
    sequenceNo?: number;
    active?: boolean;
}

export interface MetaData {
    wsdlType?: string;
    wsdlValue?: string;
    wsdlContent?: string;
    blockType?: string;
    contentType?: string;
    targetType?: string;
    sourceType?: string;
    dataType?: string;
    processType?: string;
    formatType?: string;
    formatId?: string;
    formatName?: string;
    fileDetails?: {
        excelType?: string;
        password?: string;
    };
    fileExtensions?: Array<{
        extension: string;
        custom: boolean;
    }>;
    fileMaxSize?: number;
    fileNameRegexs?: Array<string>;
    character?: string;
    connectionDetails?: ConnectionDetails;
    xslt?: any;
    source?: string;
    target?: string;
    operation?: string;
    skipStartRows?: number;
    skipEndRows?: number;
    generateHeaders?: boolean;
    outputDirectory?: string;
    inputDirectory?: Array<string> | string;
    outputDirectories?: Array<{
        path: string;
    }>;
    inputDirectories?: Array<{
        path: string;
        watchSubDirectories: boolean;
    }>;
    mirrorInputDirectories?: boolean;
    inputName?: string;
    inputType?: string;
    customHeaders?: any;
    customHeadersList?: any;
    secretIds?: Array<string>;
    uniqueRemoteTransaction?: boolean;
    uniqueRemoteTransactionOptions?: {
        fileName?: boolean;
        checksum?: boolean;
    };
    ipWhitelistEnabled?: boolean;
    ipList?: Array<string>;
}

export interface Format {
    id?: string;
    name?: string;
    attributeCount?: number;
    type?: string;
    definition?: any;
    formatType?: string;
    excelType?: string;
    character?: string;
    length?: number;
}

export interface ConnectionDetails {
    url?: string;
    connectionType?: string;
    sslType?: string;
    serverCertificate?: string;
    trustAllCerts?: boolean;
    validateServerIdentity?: boolean;
    validateClientIdentity?: boolean;
    twoWaySSL?: boolean;
    multipartAttribute?: string;
    requestTimeout?: number;
}
