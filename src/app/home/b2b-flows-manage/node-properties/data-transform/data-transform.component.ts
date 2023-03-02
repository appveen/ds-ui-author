import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { B2bFlowService } from '../../b2b-flow.service';

@Component({
  selector: 'odp-data-transform',
  templateUrl: './data-transform.component.html',
  styleUrls: ['./data-transform.component.scss']
})
export class DataTransformComponent implements OnInit {

  @Input() edit: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  @Output() close: EventEmitter<any>;
  globalType: string;
  customTargetFields: Array<any>;
  data: any;
  sampleJSON: any;
  inputDataStructure: any;
  triggerAddChild: EventEmitter<any>;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private flowService: B2bFlowService) {
    this.nodeList = [];
    this.close = new EventEmitter();
    this.customTargetFields = [];
    this.triggerAddChild = new EventEmitter();
    this.globalType = 'object';
  }

  ngOnInit(): void {
    this.inputDataStructure = this.currNode.dataStructure.outgoing || {};
    this.data = this.currNode.body;
    if (!this.data && this.inputDataStructure) {
      this.data = this.flowService.jsonFromStructure(this.inputDataStructure);
    }
    if (this.data && typeof this.data == 'object') {
      this.sampleJSON = this.data;
    } else {
      this.sampleJSON = {};
    }
  }

  cancel() {
    this.sampleJSON = this.data;
    this.close.emit(false);
  }

  done() {
    this.currNode.body = this.sampleJSON;
    this.data = this.sampleJSON;
    this.cancel();
  }


  onDataChange(data: any) {
    console.log('onDataChange', data);
    this.sampleJSON = data;
  }

  addFromRoot() {
    this.triggerAddChild.emit();
  }

  get globalValue() {
    if (this.data) {
      return Object.keys(this.data).length + ' Items';
    }
    return '0 Items'
  }
}


export class Field {
  key: string;
  type: string;
  value: string | number | boolean | null;
  data: any;

  constructor(data?: any) {
    if (data) {
      this.key = data.key;
      this.type = data.type;
      this.value = data.value;
    } else {
      this.key = '';
      this.type = 'string';
      this.value = null;
    }
  }
}