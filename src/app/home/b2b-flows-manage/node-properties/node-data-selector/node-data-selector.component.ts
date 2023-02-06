import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { B2bFlowService } from '../../b2b-flow.service';

@Component({
  selector: 'odp-node-data-selector',
  templateUrl: './node-data-selector.component.html',
  styleUrls: ['./node-data-selector.component.scss']
})
export class NodeDataSelectorComponent implements OnInit {

  @Input() textarea: boolean;
  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;
  @Input() nodeList: Array<any>;
  @Input() edit: any;
  toggleNodeSelector: boolean;
  configuredData: any;
  availableHeaderKeys: Array<string>;
  availableBodyKeys: Array<any>;
  dataKey: string;
  valueType: string;
  constructor(private flowService: B2bFlowService) {
    this.nodeList = [];
    this.edit = {
      status: true
    };
    this.valueChange = new EventEmitter();
    this.configuredData = {};
    this.availableHeaderKeys = ['authorization', 'content-type', 'token', 'ip', 'custom'];
    this.availableBodyKeys = [];
    this.valueType = 'dynamic';
    this.dataKey = 'authorization';
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
    this.toggleNodeSelector = !this.toggleNodeSelector;
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
    this.value = '{{' + this.currentValue + '}}';
    console.log(this.currentValue);

    this.valueChange.emit(this.value);
    this.toggleNodeSelector = false;
  }
  cancel() {
    this.toggleNodeSelector = false;
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

  getNodeType(type: string) {
    return this.flowService.getNodeType(type);
  }

  get currentValue() {
    return this.flowService.getDynamicValue(this.configuredData);
  }

  get userSelectedValue() {
    return this.flowService.getDynamicLabel(this.configuredData, this.nodeList);
  }
}
