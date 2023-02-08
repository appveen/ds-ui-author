import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { B2bFlowService } from '../../b2b-flow.service';

@Component({
  selector: 'odp-input-data-selector',
  templateUrl: './input-data-selector.component.html',
  styleUrls: ['./input-data-selector.component.scss']
})
export class InputDataSelectorComponent implements OnInit {

  @Input() edit: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;
  prevNode: any;
  showCustomWindow: boolean;
  fields: Array<any>;
  dataType: string;
  togglePasteWindow: boolean;
  toggle: any;
  insertText: EventEmitter<string>;
  constructor(private flowService: B2bFlowService) {
    this.edit = { status: true };
    this.dataChange = new EventEmitter();
    this.fields = [];
    this.dataType = 'single';
    this.toggle = {};
    this.insertText = new EventEmitter();
  }

  ngOnInit(): void {
    this.prevNode = this.nodeList.find(e => e.onSuccess.findIndex(es => es._id == this.currNode._id) > -1);
    console.log(this.data, this.currNode, this.prevNode);
  }

  toggleDataType(flag: boolean, type: string) {
    this.data = null;
    this.dataChange.emit(null);
    if (flag) {
      this.dataType = type;
    }
  }

  showPayloadFromWindow() {
    this.togglePasteWindow = true;
  }

  onSourceChange(type: string) {
    if (!type) {
      this.data = null;
      this.dataChange.emit(null);
    } else {
      this.showCustomWindow = true;
    }
  }

  onVariableSelect(data: string) {
    if (data.startsWith('{{')) {
      data = data.substring(2, data.length - 2);
    }
    this.insertText.emit(data);
  }

  onDataChange(data: string) {
    if (data && data.startsWith('{{')) {
      this.data = data.substring(2, data.length - 2);
    } else {
      this.data = data;
    }
    this.dataChange.emit(this.data);
  }

  cancel() {
    this.showCustomWindow = false;
  }

  addField() {
    this.fields.push({});
  }

  onPaste(event: any) {
    console.log(event);
  }

  get userData() {
    let temp;
    if (this.data && this.data.startsWith('node[')) {
      temp = '{{' + this.data + '}}';
      return this.flowService.getDynamicLabel(this.flowService.parseDynamicValue(temp), this.nodeList);
    }
    return this.data;
  }
}
