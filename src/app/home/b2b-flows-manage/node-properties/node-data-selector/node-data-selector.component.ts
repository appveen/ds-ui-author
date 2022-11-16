import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'odp-node-data-selector',
  templateUrl: './node-data-selector.component.html',
  styleUrls: ['./node-data-selector.component.scss']
})
export class NodeDataSelectorComponent implements OnInit {

  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;
  @Input() nodeList: Array<any>;
  @Input() edit: any;
  toggleNodeSelector: boolean;
  selectedNode: any;
  nodeDataField: string;
  tempValue: Array<string>;
  tempDataKey: string;
  constructor() {
    this.nodeList = [];
    this.edit = {
      status: true
    };
    this.valueChange = new EventEmitter();
    this.tempValue = [];
  }

  ngOnInit(): void {
    console.log(this.nodeList);
  }

  onClick(event: any) {
    event.preventDefault();
    this.toggleNodeSelector = !this.toggleNodeSelector;
  }

  selectNode(item: any) {
    this.selectedNode = item;
    if (item) {
      this.tempValue.push(`node["${this.selectedNode._id}"]`);
    } else {
      this.tempValue.splice(0, 1);
    }
  }
  selectNodeDataKey(dataKey: string) {
    this.nodeDataField = dataKey;
    if (dataKey) {
      this.tempValue.push(dataKey);
    } else {
      this.tempValue.splice(1, 1);
    }
  }

  saveData() {
    this.value = '{{' + this.currentValue + '}}';
    this.valueChange.emit(this.value);
    this.toggleNodeSelector = false;
  }
  cancel() {
    this.toggleNodeSelector = false;
    this.selectedNode = null;
    this.nodeDataField = null;
    this.tempDataKey = null;
  }

  get currentValue() {
    if (this.tempDataKey) {
      return this.tempValue.join('.') + `['${this.tempDataKey}']`;
    }
    return this.tempValue.join('.');
  }
}
