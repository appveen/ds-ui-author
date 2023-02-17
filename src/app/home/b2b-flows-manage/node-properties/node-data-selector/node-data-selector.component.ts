import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { B2bFlowService } from '../../b2b-flow.service';

@Component({
  selector: 'odp-node-data-selector',
  templateUrl: './node-data-selector.component.html',
  styleUrls: ['./node-data-selector.component.scss']
})
export class NodeDataSelectorComponent implements OnInit {

  @Input() toggle: boolean;
  @Output() toggleChange: EventEmitter<boolean>;
  @Input() number: boolean;
  @Input() textarea: boolean;
  @Input() value: any;
  @Output() valueChange: EventEmitter<any>;
  @Input() nodeList: Array<any>;
  @Input() edit: any;
  configuredData: any;
  availableHeaderKeys: Array<string>;
  availableBodyKeys: Array<any>;
  dataKey: string;
  valueType: string;
  insertText: EventEmitter<string>;
  openSelector: boolean;
  constructor(private flowService: B2bFlowService) {
    this.nodeList = [];
    this.edit = {
      status: false
    };
    this.toggleChange = new EventEmitter();
    this.valueChange = new EventEmitter();
    this.configuredData = {};
    this.availableHeaderKeys = ['authorization', 'content-type', 'token', 'ip', 'custom'];
    this.availableBodyKeys = [];
    this.valueType = 'dynamic';
    this.dataKey = 'authorization';
    this.insertText = new EventEmitter();
  }

  ngOnInit(): void {
    if (!environment.production) {
      console.log(this.nodeList);
    }
    if (this.value) {
      this.configuredData = this.flowService.parseDynamicValue(this.value);
      if (this.configuredData.customValue) {
        this.valueType = 'custom';
      } else {
        this.valueType = 'dynamic';
      }
    }
  }

  onClick(event: any) {
    event.preventDefault();
    this.toggle = !this.toggle;
  }

  toggleValueType(flag: boolean, type: string) {
    this.configuredData = {};
    if (flag) {
      this.valueType = type;
    }
  }

  onNodeSelect(node: any) {
    if (node.dataStructure && node.dataStructure.outgoing && node.dataStructure.outgoing.definition) {
      this.availableBodyKeys = node.dataStructure.outgoing.definition;
      this.dataKey = 'dynamic';
    } else {
      // this.availableBodyKeys = [{ properties: { name: 'Custom' } }];
      this.dataKey = 'custom';
    }
  }

  saveData() {
    if (this.dataKey == 'dynamic') {
      this.value = '{{' + this.currentValue + '}}';
    } else {
      this.value = this.currentValue;
    }
    // this.value = '{{' + this.currentValue + '}}';
    this.valueChange.emit(this.value);
    this.toggle = false;
    this.toggleChange.emit(this.toggle);
  }
  cancel() {
    this.toggle = false;
    this.toggleChange.emit(this.toggle);
    this.configuredData = {};
  }

  stepBack() {
    if (this.configuredData.dataKey) {
      this.configuredData.dataKey = null;
    } else if (this.configuredData.nodeKey) {
      this.configuredData.nodeKey = null;
    } else {
      this.configuredData = {};
    }
  }

  getNodeType(node: any) {
    return this.flowService.getNodeType(node);
  }

  get currentValue() {
    return this.flowService.getDynamicValue(this.configuredData);
  }

  get userSelectedValue() {
    return this.flowService.getDynamicLabel(this.configuredData, this.nodeList);
  }
}
