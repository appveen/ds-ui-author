import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { NodeData, FlowData } from '../integration-flow.model';
import { IntegrationFlowService } from '../integration-flow.service';

@Component({
  selector: '[odp-req-flow]',
  templateUrl: './req-flow.component.html',
  styleUrls: ['./req-flow.component.scss']
})
export class ReqFlowComponent implements OnInit {

  @Input() edit: any;
  @Input() partner: UntypedFormGroup;
  @Input() flowData: FlowData;
  @Input() nodeList: Array<NodeData>;
  @Output() nodeListChange: EventEmitter<Array<NodeData>>;
  apiCalls: any;
  constructor(private flowService: IntegrationFlowService) {
    const self = this;
    self.edit = {
      status: false
    };
    self.nodeList = [];
    self.nodeListChange = new EventEmitter();
    self.apiCalls = {};
  }

  ngOnInit() {
    const self = this;
    self.flowService.deleteNode.subscribe(data => {
      if (data.type === 'request') {
        self.deleteNode(data.index);
      }
    });
  }

  selectNode(event: Event, index: number) {
    const self = this;
    self.flowService.nodeSelected.emit({
      index,
      type: 'request'
    });
    self.nodeList[index].active = true;
    event.stopPropagation();
    self.flowService.activateProperties.emit({
      nodeList: self.nodeList,
      index,
      partner: self.partner,
      flowData: self.flowData,
      type: 'request'
    });
  }

  selectTimerNode(event) {
    const self = this;
    event.stopPropagation();
    
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
    temp.meta.flowType = 'request';
    temp.meta.blockType = 'PROCESS';
    temp.meta.processType = 'REQUEST';
    temp.meta.formatType = 'nanoService';
    self.nodeList.splice(index, 0, self.flowService.nodeInstance(temp));
  }

  deleteNode(index: number) {
    const self = this;
    self.nodeList.splice(index, 1);
  }

  getAddOffset(index: number) {
    return (114 * index) - 10;
    // return (114 * index) + 24 + 32;
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
    return (114 * index);
    // return (114 * index) + 24 + (index > 0 ? 36 : 0);
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
    return (114 * index);
    // return (114 * index) + 24 + 36;
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

  get hasLastNode() {
    const self = this;
    const temp: NodeData = self.nodeList[self.nodeList.length - 1];
    if (temp.meta.blockType === 'OUTPUT') {
      return true;
    }
    return false;
  }

  get apiCallPending() {
    const self = this;
    return Object.values(self.apiCalls).filter(e => e).length > 0;
  }

  get width() {
    const self = this;
    return (self.nodeList.length * 144) + 96;
  }

  get viewBox() {
    const self = this;
    return `-20 -20 ${self.width} 350`;
  }
}

