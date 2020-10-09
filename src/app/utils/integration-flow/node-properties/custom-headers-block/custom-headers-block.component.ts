import { Component, OnInit, Input } from '@angular/core';

import { NodeData, EditConfig, ActivateProperties, FlowData } from '../../integration-flow.model';
import { IntegrationFlowService } from '../../integration-flow.service';
import { Definition } from 'src/app/utils/mapper/mapper.model';

@Component({
  selector: 'odp-custom-headers-block',
  templateUrl: './custom-headers-block.component.html',
  styleUrls: ['./custom-headers-block.component.scss']
})
export class CustomHeadersBlockComponent implements OnInit {

  @Input() flowData: FlowData;
  @Input() edit: EditConfig;
  @Input() node: NodeData;
  @Input() nodeList: Array<NodeData>;
  @Input() index: number;
  hideBlock: boolean;
  constructor(private flowService: IntegrationFlowService) {
    const self = this;
    self.node = self.flowService.nodeInstance();
    self.nodeList = [];
  }

  ngOnInit() {
    const self = this;
  
  }

  addNewHeader() {
    const self = this;
    if (!self.node.meta.customHeadersList) {
      self.node.meta.customHeadersList = [];
    }
    self.node.meta.customHeadersList.push({
      header: null,
      key: null,
      value: null,
      new: true,
      checked: true
    });
  }

  removeHeader(index: number) {
    const self = this;
    self.node.meta.customHeadersList.splice(index, 1);
    
    self.headerToggle();
  }

  headerKeyChange(item, value) {
    const self = this;
    if (!self.edit.status) {
      return;
    }
    item.key = value;
    if (self.node.meta.blockType === 'INPUT' || self.node.meta.blockType === 'OUTPUT') {
      item.header = self.flowService.convertHeader('ODP-F-', item.key);
    } else if (self.node.meta.formatType === 'nanoService') {
      item.header = self.flowService.convertHeader('ODP-NS-', item.key);
    } else {
      item.header = self.flowService.convertHeader('ODP-DS-', item.key);
    }
    self.headerToggle();
  }

  headerToggle() {
    const self = this;
    const headers = self.flowService.convertHeadersToDefinition(self.node.meta.customHeadersList);
    if (headers) {
      if (!self.node.sourceFormat.definition) {
        self.node.sourceFormat.definition = {};
      }
      if (!self.node.targetFormat.definition) {
        self.node.targetFormat.definition = {};
      }
      if (typeof self.node.sourceFormat.definition === 'string') {
        self.node.sourceFormat.definition = JSON.parse(self.node.sourceFormat.definition);
      }
      if (typeof self.node.targetFormat.definition === 'string') {
        self.node.targetFormat.definition = JSON.parse(self.node.targetFormat.definition);
      }
      self.node.sourceFormat.definition['$headers'] = headers;
      self.node.targetFormat.definition['$headers'] = headers;
    } else {
      delete self.node.sourceFormat.definition['$headers'];
      delete self.node.targetFormat.definition['$headers'];
    }
    self.removeMapping();
  }

  removeMapping() {
    const self = this;
    if (self.leftXSLT) {
      const temp = self.leftXSLT;
      if (temp.meta.xslt && temp.meta.xslt['$headers']) {
        temp.meta.xslt['$headers'] = self.flowService.convertHeadersToDefinition(temp.meta.customHeadersList);
      }
     
      temp.mapping.filter(e => e.target.path.startsWith('$headers'))
        .forEach(e => {
          e.source.splice(0);
          e.source.push(Definition.getInstance());
        });
    }
    if (self.rightXSLT) {
      const temp = self.rightXSLT;
      if (temp.meta.xslt && temp.meta.xslt['$headers']) {
        temp.meta.xslt['$headers'] = self.flowService.convertHeadersToDefinition(temp.meta.customHeadersList);
      }
      
      temp.mapping.filter(e => e.target.path.startsWith('$headers'))
        .forEach(e => {
          e.source.splice(0);
          e.source.push(Definition.getInstance());
        });
    }
  }

  refreshView() {
    const self = this;
    self.hideBlock = true;
    setTimeout(() => {
      self.hideBlock = false;
    }, 10);
  }

  get isHeadersMapped() {
    const self = this;
    const flag: any = {};
    if (self.leftXSLT.meta.xslt && self.leftXSLT.meta.xslt['$headers']) {
      flag.left = true;
    }
    if (self.rightXSLT && self.rightXSLT.meta.xslt && self.rightXSLT.meta.xslt['$headers']) {
      flag.right = true;
    }
    return flag;
  }

  get leftXSLT() {
    const self = this;
    return self.node;
  }

  get rightXSLT() {
    const self = this;
    if (self.index === self.nodeList.length - 1) {
      return null;
    } else {
      return self.nodeList[self.index + 1];
    }
  }

  get showHeaders() {
    const self = this;
    if (self.node.meta.targetType === 'REST'
      || self.node.meta.targetType === 'SOAP'
      || self.node.meta.formatType === 'nanoService') {
      return true;
    }
    return false;
  }

  get isLastNode() {
    const self = this;
    if (self.nodeList.length - 1 === self.index) {
      return true;
    }
    return false;
  }

  get errors() {
    const self = this;
    return self.flowService.getNodeErrors(self.flowData, self.node, self.index > 0 ? self.nodeList[self.index - 1] : null);
  }
}
