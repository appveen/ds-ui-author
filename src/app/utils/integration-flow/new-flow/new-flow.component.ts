import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppService } from '../../services/app.service';
import { FlowData, EditConfig } from '../integration-flow.model';
import { IntegrationFlowService } from '../integration-flow.service';

@Component({
  selector: 'odp-new-flow',
  templateUrl: './new-flow.component.html',
  styleUrls: ['./new-flow.component.scss']
})
export class NewFlowComponent implements OnInit {

  @Input() edit: EditConfig;
  @Input() data: FlowData;
  @Output() dataChange: EventEmitter<FlowData>;
  @Output() done: EventEmitter<any>;
  @Output() cancel: EventEmitter<any>;
  firstNodeData: any;
  oldData: FlowData;
  constructor(private appService: AppService,
    private flowService: IntegrationFlowService) {
    const self = this;
    self.edit = {
      status: false
    };
    self.oldData = {};
    self.data = {
      timer: {
        enabled: false,
        cronRegEx: ''
      }
    };
    self.dataChange = new EventEmitter();
    self.done = new EventEmitter();
    self.cancel = new EventEmitter();
    self.firstNodeData = self.flowService.nodeInstance({
      meta: {
        wsdlType: 'url',
        blockType: 'INPUT',
        flowType: 'request',
        sourceType: 'REST',
        targetType: 'REST',
        character: ',',
        fileDetails: {},
        connectionDetails: {
          connectionType: 'PLAIN'
        }
      }
    });
  }

  ngOnInit() {
    const self = this;
    self.fixData();
    self.oldData = self.appService.cloneObject(self.data);
  }

  onDone() {
    const self = this;
    const payload: FlowData = self.data;
    if (!payload.timer) {
      payload.timer = {
        enabled: false,
        cronRegEx: ''
      };
    }
    if (self.inputType === 'timer') {
      payload.timer.enabled = true;
    }
    payload.inputType = self.inputType.toUpperCase();
    self.dataChange.emit(payload);
    self.done.emit(self.data);
  }

  onCancel() {
    const self = this;
    self.data.direction = self.oldData.direction;
    self.data.blocks.splice(0, 1, self.oldData.blocks[0]);
    if (self.oldData.blocks[1]) {
      self.data.blocks.splice(1, 1, self.oldData.blocks[1]);
    }
    self.cancel.emit(self.data);
  }

  onDirectionChange(value) {
    const self = this;
    const firstNode = self.data.blocks[0];
    const lastNode = self.data.blocks[self.data.blocks.length - 1];
    if (firstNode.meta.sourceType === 'FILE' || firstNode.meta.targetType === 'FILE') {
      firstNode.meta.source = undefined;
      firstNode.meta.target = undefined;
    }
    if (lastNode.meta.sourceType === 'FILE' || lastNode.meta.targetType === 'FILE') {
      lastNode.meta.source = undefined;
      lastNode.meta.target = undefined;
    }
  }

  fixData() {
    const self = this;
    if (!self.data) {
      self.data = {};
    }
    if (!self.data.blocks) {
      self.data.blocks = [];
    }
    if (self.data.blocks.length === 0) {
      self.data.blocks.push(self.appService.cloneObject(self.firstNodeData));
    }
  }

  get inputType() {
    const self = this;
    self.fixData();
    if (self.data.blocks[0].meta.sourceType === 'TIMER') {
      return 'timer';
    } else if (self.data.blocks[0].meta.sourceType === 'FILE') {
      return 'file';
    } else {
      return 'api';
    }
  }

  set inputType(val) {
    const self = this;
    self.fixData();
    self.data.blocks.splice(0, 1, self.appService.cloneObject(self.firstNodeData));
    if (val === 'timer') {
      self.data.blocks[0].meta.sourceType = 'TIMER';
      self.data.blocks[0].meta.targetType = 'TIMER';
    } else if (val === 'file') {
      self.data.blocks[0].meta.sourceType = 'FILE';
      self.data.blocks[0].meta.targetType = 'FILE';
    } else {
      self.data.blocks[0].meta.sourceType = 'REST';
      self.data.blocks[0].meta.targetType = 'REST';
    }
    if (self.data.blocks.length > 1) {
      delete self.data.blocks[1].mapping;
      delete self.data.blocks[1].meta.xslt;
    }
  }

  get isValid() {
    const self = this;
    let errorCount = 0;
    if (!self.data || !self.data.name || !self.data.inputType || !self.data.direction) {
      errorCount++;
    }
    if (self.data && self.data.name && (self.data.name.length > 40)) {
      errorCount++;
    }
    return errorCount === 0;
  }
}
