import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { IntegrationFlowService } from '../integration-flow.service';
import { NodeData, EditConfig, ActivateProperties, FlowData } from '../integration-flow.model';
import { IndexToPosPipe } from '../../pipes/index-to-pos/index-to-pos.pipe';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'odp-node-properties',
  templateUrl: './node-properties.component.html',
  styleUrls: ['./node-properties.component.scss'],
  providers: [IndexToPosPipe]
})
export class NodePropertiesComponent implements OnInit {

  @ViewChild('mapperToolTip', { static: false }) mapperToolTip: NgbTooltip;
  @ViewChild('dataMapping', { static: false }) dataMapping: ElementRef;
  @Input() edit: EditConfig;
  @Input() flowData: FlowData;
  @Input() reqNodeList: Array<NodeData>;
  @Input() resNodeList: Array<NodeData>;
  @Input() errNodeList: Array<NodeData>;
  @Output() deleteNode: EventEmitter<any>;
  nodeList: Array<NodeData>;
  node: NodeData;
  index: number;
  editNodeName: boolean;
  openMapper: boolean;
  deleteNodeModal: EventEmitter<any>;
  propertyType: string;
  partner: any;

  constructor(private flowService: IntegrationFlowService,
    private indexToPos: IndexToPosPipe,
    private commonService: CommonService) {
    const self = this;
    self.deleteNode = new EventEmitter();
    self.deleteNodeModal = new EventEmitter();
    self.node = self.flowService.nodeInstance();
    self.nodeList = [];
    self.reqNodeList = [];
    self.resNodeList = [];
    self.errNodeList = [];
    self.edit = {
      status: true
    };
    self.flowData = {};
    self.propertyType = 'request';
  }

  ngOnInit() {
    const self = this;
    self.flowService.activateProperties.subscribe((data: ActivateProperties) => {
      self.nodeList = data.nodeList;
      self.index = data.index;
      self.node = self.nodeList[data.index];
      self.flowData = data.flowData;
      self.partner = data.partner;
      self.propertyType = data.type;
      if (!self.node.meta.b2BFlowMaxConcurrentFiles) {
        self.node.meta.b2BFlowMaxConcurrentFiles = {};
      }
      if (typeof self.node.meta.b2BFlowMaxConcurrentFiles.value === 'object'
        || typeof self.node.meta.b2BFlowMaxConcurrentFiles.value === 'undefined') {
        self.node.meta.b2BFlowMaxConcurrentFiles.status = false;
        self.node.meta.b2BFlowMaxConcurrentFiles.value = (self.commonService.userDetails.b2BFlowMaxConcurrentFiles || 0);
      }
    });
    self.flowService.autoMapped.subscribe(data => {
      try {
        if (self.mapperToolTip) {
          self.mapperToolTip.close();
          self.mapperToolTip.autoClose = true;
        }
      } catch (e) {
        console.error(e);
      }
      if (self.mapperToolTip && self.mapperToolTip.isOpen()) {
        self.mapperToolTip.close();
      }
      self.mapperToolTip.open();
    });
  }

  triggerDeleteNode() {
    const self = this;
    const pos = self.indexToPos.transform(self.index);
    const modalData: any = {
      title: 'Delete Node?',
      message: 'Are you sure you want to delete <span class="text-danger">' + (self.node.name ? self.node.name : pos) + ' node</span>',
      index: self.index
    };
    self.deleteNodeModal.emit(modalData);
  }

  onDeleteNode(data) {
    const self = this;
    if (data) {
      self.flowService.deleteNode.emit({
        index: data.index,
        type: self.propertyType
      });
    }
  }

  scrollIntoView() {
    const self = this;
    if (self.dataMapping && self.dataMapping.nativeElement) {
      self.dataMapping.nativeElement.scrollIntoView();
    }
  }

  get errors() {
    const self = this;
    if (self.index > 0) {
      return self.flowService.getNodeErrors(self.flowData, self.node, self.index > 0 ? self.nodeList[self.index - 1] : null);
    } else {
      if (self.propertyType === 'error') {
        return self.flowService.getNodeErrors(self.flowData, self.node, self.flowService.getErrorNode());
      } else if (self.propertyType === 'response') {
        return self.flowService.getNodeErrors(self.flowData, self.node, self.reqNodeList[self.reqNodeList.length - 1]);
      } else {
        return self.flowService.getNodeErrors(self.flowData, self.node, null);
      }
    }
  }

  get mapperLeft() {
    const self = this;
    if (self.index === 0) {
      if (self.propertyType === 'error') {
        return self.flowService.getErrorNode();
      } else if (self.propertyType === 'response') {
        return self.reqNodeList[self.reqNodeList.length - 1];
      } else {
        return null;
      }
    } else {
      return self.nodeList[self.index - 1];
    }
  }

  get mapperRight() {
    const self = this;
    return self.node;
  }

  get mappedAttributes() {
    const self = this;
    if (self.node.mapping && self.node.mapping.length > 0) {
      return self.node.mapping.reduce((p, e) => p + (e.source ? e.source.filter(s => s.name).length : 0), 0);
    }
    return 0;
  }

  get attributesAvailable() {
    const self = this;
    if (self.node.mapping && self.node.mapping.length > 0) {
      return self.node.mapping.filter(e => e.target.type !== 'Array' && e.target.type !== 'Object').length;
    }
    return 0;
  }

  get enableThrottling() {
    const self = this;
    if (self.node.meta.b2BFlowMaxConcurrentFiles
      && self.node.meta.b2BFlowMaxConcurrentFiles.status) {
      return true;
    }
    return false;
  }

  set enableThrottling(val) {
    const self = this;
    self.node.meta.b2BFlowMaxConcurrentFiles.status = val;
  }

  get timeboundFeatureActive() {
    const self = this;
    if (self.commonService.userDetails && self.commonService.userDetails.b2BEnableTimebound) {
      return true;
    }
    return false;
  }
}
