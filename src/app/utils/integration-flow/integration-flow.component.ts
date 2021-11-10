import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { NodeData, FlowData } from './integration-flow.model';
import { CommonService, GetOptions } from '../services/common.service';
import { AppService } from '../services/app.service';
import { IntegrationFlowService } from './integration-flow.service';

@Component({
  selector: 'odp-integration-flow',
  templateUrl: './integration-flow.component.html',
  styleUrls: ['./integration-flow.component.scss']
})
export class IntegrationFlowComponent implements OnInit, OnDestroy {

  @ViewChild('pageChangeModalTemplate', { static: true }) pageChangeModalTemplate: boolean;
  @Input() toggleMicroflow: boolean;
  @Output() toggleMicroflowChange: EventEmitter<boolean>;
  @Input() id: any;
  @Output() idChange: EventEmitter<any>;
  @Input() partner: FormGroup;
  edit: any;
  reqNodeList: Array<NodeData>;
  resNodeList: Array<NodeData>;
  errNodeList: Array<NodeData>;
  transformPhase: Array<any>;
  data: FlowData;
  oldValue: any;
  subscriptions: any;
  pageChangeModalTemplateRef: NgbModalRef;
  toggleIssuesWindow: boolean;
  editDirection: boolean;
  apiCalls: any;
  timerNodeSelected: boolean;
  moveCanvas: EventEmitter<number>;
  canvasPosition: number;
  partnerAgent: any;
  constructor(public commonService: CommonService,
    private appService: AppService,
    private flowService: IntegrationFlowService,
    private ts: ToastrService) {
    const self = this;
    self.toggleMicroflowChange = new EventEmitter();
    self.idChange = new EventEmitter();
    self.reqNodeList = [];
    self.resNodeList = [];
    self.errNodeList = [];
    self.subscriptions = {};
    self.apiCalls = {};
    self.transformPhase = [];
    self.moveCanvas = new EventEmitter();
    self.edit = {
      status: false
    };
  }

  ngOnInit() {
    const self = this;
    self.reqNodeList = [];
    self.getMicroflowData();
    self.flowService.nodeSelected.subscribe((data) => {
      self.deSelectAllNode();
      if (data.type === 'timer') {
        self.timerNodeSelected = true;
      }
    });
    self.edit.status = !self.flowService.onlyView;
    self.flowService.nodeTypeChange.subscribe((node: NodeData) => {
      self.flowService.patchPartnerAgent(self.data.blocks, self.partnerAgent, self.data.direction);
    });
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(key => {
      if (self.subscriptions[key]) {
        self.subscriptions[key].unsubscribe();
      }
    });
    self.flowService.apiCache = {};
  }

  onDone(value: any) {
    const self = this;
    self.editDirection = false;
    self.flowService.patchPartnerAgent(self.data.blocks, self.partnerAgent, self.data.direction);
  }

  onCancel(value: any) {
    const self = this;
    self.editDirection = false;
    self.flowService.patchPartnerAgent(self.data.blocks, self.partnerAgent, self.data.direction);
  }

  back() {
    const self = this;
    if (self.edit.status && self.changesDone) {
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

  getMicroflowData() {
    const self = this;
    self.reqNodeList = [];
    self.apiCalls.getMicroflowData = true;
    self.commonService.get('partnerManager', '/flow/' + self.id).subscribe((data: FlowData) => {
      self.getPartnerAgent(data.partner);
      if (!data.timer) {
        data.timer = { enabled: false, cronRegEx: '', timebounds: [] };
      }
      if (!data.successBlocks) {
        data.successBlocks = [];
      }
      if (!data.errorBlocks) {
        data.errorBlocks = [];
      }
      self.data = data;
      self.data.blocks.forEach(e => e.meta.flowType = 'request');
      self.data.successBlocks.forEach(e => e.meta.flowType = 'response');
      self.data.errorBlocks.forEach(e => e.meta.flowType = 'error');
      self.data.blocks = self.reqNodeList = self.flowService.parseNodes(data.blocks);
      self.data.successBlocks = self.resNodeList = self.flowService.parseNodes(data.successBlocks);
      self.data.errorBlocks = self.errNodeList = self.flowService.parseNodes(data.errorBlocks);
      if (self.data.structures && self.data.structures.length > 0) {
        self.data.structures.forEach(e => delete e._id);
      }
      self.oldValue = self.appService.cloneObject(data);
      self.oldValue.blocks.forEach(e => delete e.active);
      self.apiCalls.getMicroflowData = false;
    }, err => {
      self.apiCalls.getMicroflowData = false;
      self.commonService.errorToast(err);
    });
  }

  getPartnerAgent(partnerId: string) {
    const self = this;
    const options: GetOptions = {
      select: 'name,agentID,type',
      filter: {
        type: 'PARTNERAGENT',
        partner: partnerId,
        app: self.commonService.app._id
      },
      count: 1,
      noApp: true
    };
    self.commonService.get('partnerManager', '/agentRegistry', options).subscribe(res => {
      if (Array.isArray(res) && res.length > 0) {
        self.partnerAgent = res[0];
        self.flowService.patchPartnerAgent(self.data.blocks, self.partnerAgent, self.data.direction);
      }
    }, err => {
      self.commonService.errorToast(null, 'Unable to Fetch Partner Agents, Please try again later.');
    });
  }

  focusNode(event: Event, index: number, type: string) {
    const self = this;
    event.stopPropagation();
    self.deSelectAllNode();
    const temp: any = {
      index,
      partner: self.partner,
      flowData: self.data,
      type
    };
    if (type === 'request') {
      temp.nodeList = self.reqNodeList;
      self.flowService.activateProperties.emit(temp);
      self.moveCanvas.emit(144 * index);
    } else if (type === 'response') {
      temp.nodeList = self.resNodeList;
      self.flowService.activateProperties.emit(temp);
      self.moveCanvas.emit((144 * index) + self.resFlowOffset);
    } else if (type === 'error') {
      temp.nodeList = self.errNodeList;
      self.flowService.activateProperties.emit(temp);
      self.moveCanvas.emit((144 * index) + self.errFlowOffset);
    }
    temp.nodeList[index].active = true;
  }

  deSelectAllNode() {
    const self = this;
    self.timerNodeSelected = false;
    self.reqNodeList.forEach(e => e.active = false);
    self.resNodeList.forEach(e => e.active = false);
    self.errNodeList.forEach(e => e.active = false);
  }

  hasErrors(obj) {
    if (obj && Object.keys(obj).length > 0) {
      return true;
    }
    return false;
  }

  createPayload(deploy) {
    const self = this;
    const payload = self.appService.cloneObject(self.data);
    const reqBlocks: Array<NodeData> = self.appService.cloneObject(self.reqNodeList);
    const resBlocks: Array<NodeData> = self.appService.cloneObject(self.resNodeList);
    const errBlocks: Array<NodeData> = self.appService.cloneObject(self.errNodeList);
    const reqBlocksTransform = self.flowService.getTransformNodes(reqBlocks, null);
    const resBlocksTransform = self.flowService.getTransformNodes(resBlocks, reqBlocks[reqBlocks.length - 1]);
    const errBlocksTransform = self.flowService.getTransformNodes(errBlocks, self.flowService.getErrorNode());

    reqBlocksTransform.forEach((e, i) => {
      reqBlocks.splice(e.index + i, 0, e.data);
    });
    resBlocksTransform.forEach((e, i) => {
      resBlocks.splice(e.index + i, 0, e.data);
    });
    errBlocksTransform.forEach((e, i) => {
      errBlocks.splice(e.index + i, 0, e.data);
    });
    const reqBlocksStructures = reqBlocks.map(self.flowService.getStructures).filter(e => Object.keys(e).length > 0);
    const resBlocksStructures = resBlocks.map(self.flowService.getStructures).filter(e => Object.keys(e).length > 0);
    const errBlocksStructures = errBlocks.map(self.flowService.getStructures).filter(e => Object.keys(e).length > 0);
    payload.structures = Array.prototype.concat.call([], reqBlocksStructures, resBlocksStructures, errBlocksStructures);
    payload.structures.push(self.flowService.getStructures(self.flowService.getErrorNode()));
    payload.blocks = reqBlocks.map(self.flowService.cleanBlock);
    payload.successBlocks = resBlocks.map(self.flowService.cleanBlock);
    payload.errorBlocks = errBlocks.map(self.flowService.cleanBlock);
    payload.app = self.commonService.app._id;
    payload.partner = self.partnerId;
    self.flowService.patchPartnerAgent(payload.blocks, self.partnerAgent, payload.direction);
    if (deploy) {
      payload.changedDependencies = [];
    }
    return payload;
  }

  save(deploy?: boolean) {
    const self = this;
    const payload = self.createPayload(deploy);
    const id = this.data.runningFlow ? this.data.runningFlow : this.data._id;
    let request;
    self.apiCalls.save = true;
    if (self.id) {
      request = self.commonService.put('partnerManager', '/flow/' + id, payload);
    } else {
      request = self.commonService.post('partnerManager', '/flow', payload);
    }
    request.subscribe(res => {
      if (deploy) {
        self.deploy();
      } else {
        self.ts.success('Flow saved successfully');
        self.toggleMicroflowChange.emit(false);
      }
      self.idChange.emit(res._id);
      self.apiCalls.save = false;
    }, err => {
      self.apiCalls.save = false;
      self.commonService.errorToast(err);
    });
  }

  deploy() {
    const self = this;
    self.apiCalls.deploy = true;
    const id = this.data.runningFlow ? this.data.runningFlow : this.data._id;
    self.commonService.put('partnerManager', '/flow/' + id + '/deploy', { app: this.commonService.app._id }).subscribe(res => {
      self.ts.success('Flow saved and deployed successfully');
      self.toggleMicroflowChange.emit(false);
      self.apiCalls.deploy = false;
    }, err => {
      self.apiCalls.deploy = false;
      self.commonService.errorToast(err);
    });
  }

  toggleFlows(type: string) {
    const self = this;
    if (type === 'error') {
      self.canvasPosition = self.errFlowOffset;
      self.moveCanvas.emit(self.errFlowOffset);
    } else {
      self.canvasPosition = 0;
      self.moveCanvas.emit(0);
    }
  }

  canvasMoved(postion: number) {
    const self = this;
    self.canvasPosition = postion;
  }

  get canEditFlow() {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('PM_' + self.id);
      if (list.length > 0) {
        return Boolean(list.find(e => e.id === 'PMPFMBU'));
      } else {
        return self.commonService.hasPermission('PMPFMBU');
      }
    }
  }

  get errorFlowActive() {
    const self = this;
    if (self.canvasPosition >= self.errFlowOffset - 1000) {
      return true;
    }
    return false;
  }

  get resFlowOffset() {
    const self = this;
    return self.reqNodeList.length * 114 + 36;
  }

  get resFlowStyle() {
    const self = this;
    return {
      transform: 'translate(' + self.resFlowOffset + 'px)'
    };
  }

  get errFlowOffset() {
    const self = this;
    const reqLen = self.reqNodeList.length * 114 + 96;
    const resLen = self.reqNodeList.length * 114 + 96;
    return reqLen + resLen + 1400;
  }

  get errFlowStyle() {
    const self = this;
    return {
      transform: 'translate(' + self.errFlowOffset + 'px)'
    };
  }

  get partnerId() {
    const self = this;
    if (self.partner && self.partner.get('_id')) {
      return self.partner.get('_id').value;
    }
    return null;
  }

  get hasActiveNode() {
    const self = this;
    let flag = false;
    if (self.reqNodeList.filter(e => e.active).length > 0) {
      flag = true;
    }
    if (self.resNodeList.filter(e => e.active).length > 0) {
      flag = true;
    }
    if (self.errNodeList.filter(e => e.active).length > 0) {
      flag = true;
    }
    if (self.timerNodeSelected) {
      flag = true;
    }
    return flag;
  }

  get flowInvalid() {
    const self = this;
    let flag = false;
    flag = self.errorsInReq.filter(e => e.error !== 'currFormatChanged' && e.error !== 'prevFormatChanged').length > 0;
    if (flag) {
      return flag;
    }
    flag = !self.reqNodeList || self.reqNodeList.length < 2;
    return flag;
  }

  get errorsInReq() {
    const self = this;
    let errors = self.reqNodeList.map((e, i, a) => self.flowService.getNodeErrors(self.data, e, i > 0 ? a[i - 1] : null));
    errors = errors.map((e1, i1) => Object.keys(e1).map((e2, i2) => {
      const temp: any = {};
      temp.nodeIndex = i1;
      temp.error = e2;
      temp.type = 'request';
      return temp;
    }));
    errors = Array.prototype.concat.apply([], errors);
    return errors;
  }

  get errorsInRes() {
    const self = this;
    let errors = self.resNodeList.map((e, i, a) => self.flowService.getNodeErrors(self.data, e, i > 0 ? a[i - 1] : null));
    errors = errors.map((e1, i1) => Object.keys(e1).map((e2, i2) => {
      const temp: any = {};
      temp.nodeIndex = i1;
      temp.error = e2;
      temp.type = 'response';
      return temp;
    }));
    errors = Array.prototype.concat.apply([], errors);
    return errors;
  }

  get errorsInErr() {
    const self = this;
    let errors = self.errNodeList.map((e, i, a) => self.flowService.getNodeErrors(self.data, e, i > 0 ? a[i - 1] : null));
    errors = errors.map((e1, i1) => Object.keys(e1).map((e2, i2) => {
      const temp: any = {};
      temp.nodeIndex = i1;
      temp.error = e2;
      temp.type = 'error';
      return temp;
    }));
    errors = Array.prototype.concat.apply([], errors);
    return errors;
  }

  get totalErrors() {
    const self = this;
    return Array.prototype.concat([], self.errorsInReq, self.errorsInRes, self.errorsInErr);
  }

  get partnerName() {
    const self = this;
    if (self.partner && self.partner.get('name')) {
      return self.partner.get('name').value;
    }
    return null;
  }

  get direction() {
    const self = this;
    if (self.data && self.data.direction) {
      return self.data.direction;
    }
    return null;
  }

  get changesDone() {
    const self = this;
    if (JSON.stringify(self.oldValue) !== JSON.stringify(self.createPayload(false))) {
      return true;
    }
    return false;
  }

  get hasLastNode() {
    const self = this;
    const temp: NodeData = self.reqNodeList[self.reqNodeList.length - 1];
    if (temp.meta.blockType === 'OUTPUT') {
      return true;
    }
    return false;
  }

  get apiCallPending() {
    const self = this;
    return Object.values(self.apiCalls).filter(e => e).length > 0;
  }
}
