import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FlowData, NodeData } from '../integration-flow.model';
import { IntegrationFlowService } from '../integration-flow.service';

@Component({
  selector: '[odp-res-flow]',
  templateUrl: './res-flow.component.html',
  styleUrls: ['./res-flow.component.scss']
})
export class ResFlowComponent implements OnInit {

  @Input() edit: any;
  @Input() partner: FormGroup;
  @Input() flowData: FlowData;
  @Input() nodeList: Array<NodeData>;
  @Output() nodeListChange: EventEmitter<Array<NodeData>>;
  apiCalls: any;
  showDropdown: boolean;
  deleteAllNodeModal: EventEmitter<any>;
  constructor(private flowService: IntegrationFlowService) {
    const self = this;
    self.edit = {
      status: false
    };
    self.nodeList = [];
    self.nodeListChange = new EventEmitter();
    self.deleteAllNodeModal = new EventEmitter();
    self.apiCalls = {};
  }

  ngOnInit() {
    const self = this;
    self.flowService.deleteNode.subscribe(data => {
      if (data.type === 'response') {
        self.deleteNode(data.index);
      }
    });
  }

  selectNode(event: Event, index: number) {
    const self = this;
    self.flowService.nodeSelected.emit({
      index,
      type: 'response'
    });
    self.nodeList[index].active = true;
    event.stopPropagation();
    self.flowService.activateProperties.emit({
      nodeList: self.nodeList,
      index,
      partner: self.partner,
      flowData: self.flowData,
      type: 'response'
    });
  }


  addNode(index: number) {
    const self = this;
    const temp: NodeData = {
      meta: {
        connectionDetails: {
          connectionType: 'PLAIN',
          trustAllCerts: false
        }
      },
    };
    temp.meta.flowType = 'response';
    temp.meta.blockType = 'PROCESS';
    temp.meta.processType = 'REQUEST';
    temp.meta.formatType = 'nanoService';
    self.nodeList.splice(index, 0, self.flowService.nodeInstance(temp));
    self.nodeListChange.emit(self.nodeList);
  }

  deleteNode(index: number) {
    const self = this;
    self.nodeList.splice(index, 1);
  }

  deleteAllNodes() {
    const self = this;
    self.showDropdown = false;
    self.deleteAllNodeModal.emit({
      title: 'Delete All Nodes?',
      message: 'Are you sure you want to delete all nodes?'
    });
  }

  triggerDeleteAllNode(data) {
    const self = this;
    if (data) {
      self.nodeList.splice(0);
    }
  }

  getAddOffset(index: number) {
    return (114 * index) + 24 + 32;
  }

  getAddStyle(index: number, offset?: number) {
    const self = this;
    if (!offset) {
      offset = 0;
    }
    const value = self.getAddOffset(index) + offset;
    return {
      transform: 'translate(' + value + 'px,28px)'
    };
  }

  getLineOffset(index: number) {
    return (114 * index) + 24 + (index > 0 ? 36 : 0);
  }

  getLineStyle(index: number, offset?: number) {
    const self = this;
    if (!offset) {
      offset = 0;
    }
    const value = self.getLineOffset(index) + offset;
    return {
      transform: 'translate(' + value + 'px,57px)'
    };
  }

  getNodeOffset(index: number) {
    return (114 * index) + 24 + 36;
  }

  getNodeStyle(index: number, offset?: number) {
    const self = this;
    if (!offset) {
      offset = 0;
    }
    const value = self.getNodeOffset(index) + offset;
    return {
      transform: 'translate(' + value + 'px,36px)'
    };
  }

  get resEndStyle() {
    const self = this;
    const value = (114 * self.nodeList.length) + 96;
    return {
      transform: 'translateX(' + value + 'px)'
    };
  }

  get apiCallPending() {
    const self = this;
    return Object.values(self.apiCalls).filter(e => e).length > 0;
  }

  get width() {
    const self = this;
    if (self.nodeList.length > 0) {
      return (self.nodeList.length * 144) + 130;
    }
    return 200;
  }

  get viewBox() {
    const self = this;
    return `-20 -20 ${self.width} 350`;
  }

}
