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
  tempValue: string;
  tempDataKey: string;
  constructor() {
    this.nodeList = [];
    this.edit = {
      status: true
    };
    this.valueChange = new EventEmitter();
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
    this.tempValue = `node["${this.selectedNode._id}"]`;
  }
  selectNodeDataKey(dataKey: string) {
    this.nodeDataField = dataKey;
    this.tempValue += `.${dataKey}`;
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
      return this.tempValue + '.' + this.tempDataKey;
    }
    return this.tempValue;
  }
}
