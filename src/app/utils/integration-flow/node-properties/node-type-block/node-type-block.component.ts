import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { NodeData, EditConfig, ActivateProperties, FlowData } from '../../integration-flow.model';
import { IntegrationFlowService } from '../../integration-flow.service';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-node-type-block',
  templateUrl: './node-type-block.component.html',
  styleUrls: ['./node-type-block.component.scss']
})
export class NodeTypeBlockComponent implements OnInit, OnDestroy {

  @ViewChild('deleteModalTemplate', { static: true }) deleteModalTemplate;
  @Input() flowData: FlowData;
  @Input() edit: EditConfig;
  @Input() nodeList: Array<NodeData>;
  @Input() node: NodeData;
  @Input() index: number;
  @Input() propertyType: string;
  selectedEndpoint: boolean;
  modalData: any;
  hideBlock: boolean;
  deleteModalTemplateRef: NgbModalRef;
  transactions: boolean;
  constructor(private flowService: IntegrationFlowService,
    private commonService: CommonService) {
    const self = this;
    self.node = self.flowService.nodeInstance();
    self.modalData = {};
    self.nodeList = [];
    self.propertyType = 'request';
  }

  ngOnInit() {
    const self = this;
    if (self.nodeList && typeof self.index === 'number') {
      self.node = self.nodeList[self.index];
    }
    self.flowService.activateProperties.subscribe((data: ActivateProperties) => {
      self.nodeList = data.nodeList;
      self.index = data.index;
      self.node = self.nodeList[data.index];
      self.propertyType = data.type;
    });
    self.transactions = self.commonService.userDetails.transactions;
  }
  ngOnDestroy() {
    const self = this;
    if (self.deleteModalTemplateRef) {
      self.deleteModalTemplateRef.close();
    }
  }

  changeNodeType(value: string) {
    const self = this;
    if (self.valuesConfigured) {
      self.modalData.title = 'Change Node Type?';
      self.modalData.message = 'Changing node type will reset this node data.<br>Are you sure you want to change node type?';
      self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate, { centered: true });
      self.deleteModalTemplateRef.result.then(close => {
        if (close) {
          self.triggerNodeTypeChange(value);
        } else {
          self.refreshView();
        }
      }, dismiss => {
        self.refreshView();
      });
    } else {
      self.triggerNodeTypeChange(value);
    }
  }

  triggerNodeTypeChange(value: string) {
    const self = this;
    delete self.node.meta.processType;
    if (self.index > 0) {
      self.node.meta.blockType = 'OUTPUT';
      self.node.meta.formatType = null;
      self.node.meta.formatId = null;
      self.node.meta.formatName = null;
    } else {
      self.node.meta.blockType = 'INPUT';
    }
    self.removeDataStructure();
    if (value === 'API') {
      self.node.meta.sourceType = 'REST';
      self.node.meta.targetType = 'REST';
    } else {
      self.node.meta.sourceType = 'FILE';
      self.node.meta.targetType = 'FILE';
    }
    self.flowService.nodeTypeChange.emit(self.node);
  }

  changeIOType(value: string) {
    const self = this;
    if (self.valuesConfigured) {
      self.modalData.title = 'Change Protocol?';
      self.modalData.message = 'Changing protocol will reset this node data.<br>Are you sure you want to change protocol?';
      self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate, { centered: true });
      self.deleteModalTemplateRef.result.then(close => {
        if (close) {
          self.triggerIOTypeChange(value);
        } else {
          self.refreshView();
        }
      }, dismiss => {
        self.refreshView();
      });
    } else {
      self.triggerIOTypeChange(value);
    }
  }

  triggerIOTypeChange(value: string) {
    const self = this;
    self.removeDataStructure();
    if (value === 'REST') {
      self.node.meta.sourceType = 'REST';
      self.node.meta.targetType = 'REST';
    } else {
      self.node.meta.sourceType = 'SOAP';
      self.node.meta.targetType = 'SOAP';
      self.node.meta.contentType = 'XML';
    }
  }

  changeFormatType(value: string) {
    const self = this;
    if (self.valuesConfigured) {
      self.modalData.title = 'Change Node Type?';
      self.modalData.message = 'Changing node type will reset this node data.<br>Are you sure you want to change node type?';
      self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate, { centered: true });
      self.deleteModalTemplateRef.result.then(close => {
        if (close) {
          self.triggerFormatTypeChange(value);
        } else {
          self.refreshView();
        }
      }, dismiss => {
        self.refreshView();
      });
    } else {
      self.triggerFormatTypeChange(value);
    }
  }

  triggerFormatTypeChange(value: string) {
    const self = this;
    self.removeDataStructure();
    self.node.meta.blockType = 'PROCESS';
    self.node.meta.processType = 'REQUEST';
    self.node.meta.sourceType = null;
    self.node.meta.targetType = null;
    if (value === 'nanoService') {
      self.node.meta.formatType = 'nanoService';
    } else {
      self.node.meta.formatType = 'dataService';
    }
  }

  removeDataStructure() {
    const self = this;
    self.node.source = null;
    self.node.sourceFormat = {};
    self.node.target = null;
    self.node.targetFormat = {};
    self.node.meta.xslt = null;
    self.node.mapping = null;
    self.node.meta.formatId = null;
    self.node.meta.formatName = null;
    delete self.node.meta.contentType;
    delete self.node.meta.processType;
  }

  refreshView() {
    const self = this;
    self.hideBlock = true;
    setTimeout(() => {
      self.hideBlock = false;
    }, 10);
  }


  get valuesConfigured() {
    const self = this;
    let flag = false;
    if (self.node.sourceFormat && self.node.sourceFormat.formatType) {
      flag = true;
    }
    if (self.node.meta.xslt) {
      flag = true;
    }
    if (self.node.meta.formatId) {
      flag = true;
    }
    return flag;
  }

  get nodeType() {
    const self = this;
    if (self.node.meta.sourceType === 'REST'
      || self.node.meta.targetType === 'REST'
      || self.node.meta.sourceType === 'SOAP'
      || self.node.meta.targetType === 'SOAP') {
      return 'API';
    } else if (self.node.meta.sourceType === 'FILE'
      || self.node.meta.targetType === 'FILE') {
      return 'FILE';
    } else {
      return self.node.meta.formatType;
    }
  }

  get ioBlock() {
    const self = this;
    if (self.node.meta.blockType === 'INPUT' || self.node.meta.blockType === 'OUTPUT') {
      return true;
    }
    return false;
  }

  get showApiOption() {
    const self = this;
    if ((self.node.meta.blockType === 'INPUT' || self.nodeList.length - 1 === self.index)) {
      return true;
    }
    return false;
  }

  get showFileOption() {
    const self = this;
    if ((self.node.meta.blockType === 'INPUT' || self.nodeList.length - 1 === self.index) && self.propertyType === 'request') {
      return true;
    }
    return false;
  }

  get showURL() {
    const self = this;
    if ((self.node.meta.blockType === 'OUTPUT' && self.node.meta.targetType === 'REST')) {
      return true;
    }
    return false;
  }

  get showTimeout() {
    const self = this;
    if ((self.node.meta.blockType === 'OUTPUT' && self.node.meta.targetType === 'REST')
      || self.node.meta.formatType === 'nanoService') {
      return true;
    }
    return false;
  }

  get showAbortOnError() {
    const self = this;
    if (self.node.meta.formatType === 'dataService') {
      return true;
    }
    return false;
  }

  get errors() {
    const self = this;
    return self.flowService.getNodeErrors(self.flowData, self.node, self.index > 0 ? self.nodeList[self.index - 1] : null);
  }
}
