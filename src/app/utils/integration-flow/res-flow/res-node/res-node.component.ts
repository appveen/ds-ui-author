import { Component, OnInit, Input } from '@angular/core';
import { NodeData, FlowData } from '../../integration-flow.model';
import { IntegrationFlowService } from '../../integration-flow.service';

@Component({
  selector: '[odp-res-node]',
  templateUrl: './res-node.component.html',
  styleUrls: ['./res-node.component.scss']
})
export class ResNodeComponent implements OnInit {

  @Input() flowData: FlowData;
  @Input() index: number;
  @Input() nodeList: Array<NodeData>;
  nodeY: number;
  node: NodeData;
  constructor(private flowService: IntegrationFlowService) {
    const self = this;
    self.node = {};
    self.nodeY = 100;
  }

  ngOnInit() {
    const self = this;
    self.node = self.nodeList[self.index];
  }

  get isActive() {
    const self = this;
    return self.node.active;
  }

  get rectX() {
    const self = this;
    if (self.node.active) {
      return '25';
    } else {
      return '36';
    }
  }

  get rectY() {
    const self = this;
    if (self.node.active) {
      return '21';
    } else {
      return '32';
    }
  }

  get rectSize() {
    const self = this;
    if (self.node.active) {
      return '64';
    } else {
      return '42';
    }
  }
  get hasErrors() {
    const self = this;
    const errors = self.flowService.getNodeErrors(self.flowData, self.node, self.index > 0 ? self.nodeList[self.index - 1] : null);
    if (self.node.formatChanged) {
      errors.currFormatChanged = true;
    }
    return Object.keys(errors).length > 0;
  }

  get nodeType() {
    const self = this;
    if (self.node && (self.node.meta.sourceType === 'REST' || self.node.meta.sourceType === 'SOAP')) {
      return 'api';
    }
    if (self.node && (self.node.meta.sourceType === 'FILE' || self.node.meta.targetType === 'FILE')) {
      return 'file';
    }
    if (self.node && (self.node.meta.formatType === 'nanoService')) {
      return 'nanoService';
    }
    if (self.node && (self.node.meta.formatType === 'dataService')) {
      return 'dataService';
    }
  }

  get nodeAlternateName() {
    const self = this;
    if (self.node && self.node.meta.formatName) {
      return self.node.meta.formatName;
    }
    if (self.node && self.node.meta.connectionDetails && self.node.meta.connectionDetails.url) {
      return self.node.meta.connectionDetails.url;
    }
    return 'Untitled Node';
  }

}
