import { Component, OnInit, Input } from '@angular/core';
import { IntegrationFlowService } from '../../integration-flow.service';
import { FlowData, NodeData } from '../../integration-flow.model';

@Component({
  selector: '[odp-req-node]',
  templateUrl: './req-node.component.html',
  styleUrls: ['./req-node.component.scss']
})
export class ReqNodeComponent implements OnInit {

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
    if (self.index === 0 && self.node.meta.sourceType === 'REST') {
      self.flowData.timer.enabled = false;
    }
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

  get circleX() {
    const self = this;
    return '56';
  }

  get circleY() {
    const self = this;
    return '53';
  }

  get circleSize() {
    const self = this;
    if (self.node.active) {
      return '32';
    } else {
      return '21';
    }
  }

  get polygonPoints() {
    const self = this;
    if (self.node.active) {
      return '24,53 56,85 88,53 56,21';
    } else {
      return '35,53 56,74 77,53 56,32';
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
