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
  // @Input() nodeList: Array<any>;
  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;
  showCustomWindow: boolean;
  dataType: string;
  toggle: any;
  inputDataStructure: any;
  sampleJSON: any;
  tempData: any;
  nodeList: Array<any>;
  constructor(private flowService: B2bFlowService) {
    this.edit = { status: false };
    this.dataChange = new EventEmitter();
    this.dataType = 'single';
    this.toggle = {};
  }

  ngOnInit(): void {
    this.toggle['payloadCreator'] = true;
    this.toggle['single'] = true;
    this.toggle['editorType'] = 'json';
    this.nodeList = this.flowService.getNodesBefore(this.currNode);
    this.inputDataStructure = this.currNode.dataStructure.incoming || {};
    if (this.data != undefined && this.data != null && typeof this.data == 'string') {
      this.dataType = 'single';
    } else {
      this.dataType = 'multiple';
    }
    if (this.data && typeof this.data == 'object') {
      this.sampleJSON = this.data;
    } else if (!this.data && this.inputDataStructure) {
      this.sampleJSON = this.flowService.jsonFromStructure(this.inputDataStructure);
    } else {
      this.sampleJSON = {};
    }

    this.flowService.dataStructureSelected.subscribe((data) => {
      if (data.currNode._id == this.currNode._id && data.type == 'incoming') {
        this.inputDataStructure = data.currNode.dataStructure.incoming || {};
        this.sampleJSON = this.flowService.jsonFromStructure(this.inputDataStructure);
      }
    });
  }

  toggleDataType(flag: boolean, type: string) {
    this.data = null;
    this.dataChange.emit(null);
    if (flag) {
      this.dataType = type;
    }
    if (type == 'multiple') {
      if (!this.sampleJSON) {
        this.sampleJSON = {};
      }
      if (Object.keys(this.sampleJSON).length == 0) {
        this.sampleJSON = { '': '' };
      }
    }
    this.showCustomWindow = true;
  }

  unsetData() {
    this.dataType = 'single';
    this.data = null;
    this.dataChange.emit(null);
  }

  selectNodeBody(item: any, type: string) {
    this.data = `{{node['${item._id}'].${type}}}`;
    this.dataChange.emit(this.data);
  }

  onDataChange(data: any) {
    this.sampleJSON = data;
    this.data = data;
    this.dataChange.emit(this.data);
  }

  onTextDataChange(text: string) {
    try {
      let data = JSON.parse(text);
      this.sampleJSON = data;
      this.data = data;
      this.dataChange.emit(this.data);
    } catch (error) {
      console.error(error);
    }
  }

  cancel() {
    if(this.data){
      delete this.data[""];
    }
    this.showCustomWindow = false;
  }

  onPaste(event: ClipboardEvent) {
    let text: string = event.clipboardData?.getData('text') as string;
    let tempObj = {};
    try {
      const obj = JSON.parse(text);
      tempObj = obj;
    } catch (err) {
      tempObj = text.split('\n').reduce((prev: any, e: string) => {
        prev[e] = "";
        return prev;
      }, {});
    }
    this.onDataChange(tempObj);
    this.toggle['pasteJSON'] = false;
    this.toggle['payloadCreator'] = false;
    setTimeout(() => {
      this.toggle['payloadCreator'] = true;
    }, 200);
  }

  getNodeType(node: any) {
    return this.flowService.getNodeType(node);
  }

  get isCustomBody() {
    return this.data && typeof this.data == 'object';
  }
  get bodyFieldsCount() {
    if (this.data) {
      return Object.keys(this.data).length;
    }
    return 0;
  }

  get userSelectedValue() {
    if (this.data && typeof this.data == 'string') {
      let configuredData = this.flowService.parseDynamicValue(this.data);
      return this.flowService.getDynamicLabel(configuredData, this.nodeList);
    }
    return null;
  }
}
