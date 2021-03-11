import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { NodeData, EditConfig, ActivateProperties, FlowData } from '../../integration-flow.model';
import { IntegrationFlowService } from '../../integration-flow.service';

@Component({
  selector: 'odp-agent-block',
  templateUrl: './agent-block.component.html',
  styleUrls: ['./agent-block.component.scss']
})
export class AgentBlockComponent implements OnInit {

  @Input() edit: EditConfig;
  @Input() node: NodeData;
  @Input() nodeList: Array<NodeData>;
  @Input() index: number;
  @Input() flowData: FlowData;
  deleteDirectoryModal: EventEmitter<any>;
  agentList: Array<any>;
  fetchingAgents: boolean;
  constructor(private flowService: IntegrationFlowService) {
    const self = this;
    self.flowData = {};
    self.deleteDirectoryModal = new EventEmitter();
    self.node = self.flowService.nodeInstance();
    self.agentList = [];
  }

  ngOnInit() {
    const self = this;

    self.fetchingAgents = true;
    self.flowService.getAgents('APPAGENT').then((agentList: any) => {
      if (self.node.meta.target && !self.node.meta.source) {
        self.node.meta.source = self.node.meta.target;
      } else {
        self.node.meta.target = self.node.meta.source;
      }
      if (typeof self.node.meta.source === 'object') {
        self.node.meta.source = '';
      }
      if (typeof self.node.meta.target === 'object') {
        self.node.meta.target = '';
      }
      self.agentList = agentList;
      self.fetchingAgents = false;
    }).catch(err => {
      self.fetchingAgents = false;
      self.agentList = [];
    });
  }

  addOutputDirectory(ele: HTMLInputElement) {
    const self = this;
    let value = ele.value;
    ele.value = null;
    if (!value || !value.trim()) {
      return;
    }
    if (!self.node.meta.outputDirectories) {
      self.node.meta.outputDirectories = [];
    }

    if (!value.startsWith('./')
      && !value.startsWith('../')
      && !value.startsWith('/')
      && !value.match(/[a-zA-Z]:.*/)) {
      value = './' + value;
    }
    if (value.endsWith('/')) {
      value = value.substr(0, value.length - 1);
    }
    if (self.node.meta.outputDirectories.findIndex(e => e.path === value) > -1) {
      return;
    }
    self.node.meta.outputDirectories.push({
      path: value
    });
  }

  addInputDirectory(ele: HTMLInputElement) {
    const self = this;
    let value = ele.value;
    ele.value = null;
    if (!value || !value.trim()) {
      return;
    }
    if (!self.node.meta.inputDirectories) {
      self.node.meta.inputDirectories = [];
    }

    if (!value.startsWith('./')
      && !value.startsWith('../')
      && !value.startsWith('/')
      && !value.match(/[a-zA-Z]:.*/)) {
      value = './' + value;
    }
    if (value.endsWith('/')) {
      value = value.substr(0, value.length - 1);
    }
    if (self.node.meta.inputDirectories.findIndex(e => e.path === value) > -1) {
      return;
    }
    self.node.meta.inputDirectories.push({
      path: value,
      watchSubDirectories: false
    });
  }

  removeOutputDirectory(index: number) {
    const self = this;
    self.deleteDirectoryModal.emit({
      title: 'Delete Directory?',
      message: 'Are you sure you want to delete <span class="font-weight-bold text-danger">'
        + self.node.meta.outputDirectories[index].path + '</span> Directory?',
      index,
      type: 'output'
    });
  }

  removeInputDirectory(index: number) {
    const self = this;
    self.deleteDirectoryModal.emit({
      title: 'Delete Directory?',
      message: 'Are you sure you want to delete <span class="font-weight-bold text-danger">'
        + self.node.meta.inputDirectories[index].path + '</span> Directory?',
      index,
      type: 'input'
    });
  }

  onDeleteDirectory(data: any) {
    const self = this;
    if (data) {
      if (data.type === 'input') {
        self.node.meta.inputDirectories.splice(data.index, 1);
      } else {
        self.node.meta.outputDirectories.splice(data.index, 1);
      }
    }
  }

  selectAppAgent(agentId: string) {
    const self = this;
    if ((self.flowData.direction === 'Inbound' && self.node.meta.blockType === 'OUTPUT')
      || (self.flowData.direction === 'Outbound' && self.node.meta.blockType === 'INPUT')) {
      self.node.meta.source = agentId;
      self.node.meta.target = agentId;
    }
  }


  get showBlock() {
    const self = this;
    if (self.node && self.node.meta.sourceType === 'FILE') {
      return true;
    }
    return false;
  }

  get showSelectAgent() {
    const self = this;
    if (self.node && self.node.meta.sourceType === 'FILE') {
      if ((self.flowData.direction === 'Inbound' && self.node.meta.blockType === 'OUTPUT')
        || (self.flowData.direction === 'Outbound' && self.node.meta.blockType === 'INPUT')) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  get appAgents() {
    const self = this;
    return self.agentList.filter(e => e.type === 'APPAGENT');
  }

  get partnerAgents() {
    const self = this;
    return self.agentList.filter(e => e.type === 'PARTNERAGENT');
  }

  get agentNotSelected() {
    const self = this;
    if (self.node && self.node.meta.blockType === 'OUTPUT'
      && self.node.meta.targetType === 'FILE'
      && !self.node.meta.target) {
      return true;
    }
    if (self.node && self.node.meta.blockType === 'INPUT'
      && self.node.meta.targetType === 'FILE'
      && !self.node.meta.source) {
      return true;
    }
    return false;
  }

  get isInputBlock() {
    const self = this;
    if (self.node && self.node.meta.blockType === 'INPUT') {
      return true;
    }
    return false;
  }

  get showGenerateHeaders() {
    const self = this;
    if (self.node && self.node.meta.blockType === 'OUTPUT' && self.node.sourceFormat.formatType !== 'FLATFILE') {
      return true;
    }
    return false;
  }

  get showAppAgentSelect() {
    const self = this;
    if ((self.flowData && self.flowData.direction === 'Inbound' && self.node && self.node.meta.blockType === 'OUTPUT')
      || (self.flowData && self.flowData.direction === 'Outbound' && self.node && self.node.meta.blockType === 'INPUT')) {
      return true;
    }
    return false;
  }
}
