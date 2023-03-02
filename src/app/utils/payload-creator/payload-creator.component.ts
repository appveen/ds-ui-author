import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { B2bFlowService } from '../../home/b2b-flows-manage/b2b-flow.service';

@Component({
  selector: 'odp-payload-creator',
  templateUrl: './payload-creator.component.html',
  styleUrls: ['./payload-creator.component.scss']
})
export class PayloadCreatorComponent implements OnInit {

  @Input() nodeList: Array<any>;
  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;
  globalType: string;
  triggerAddChild: EventEmitter<any>;
  rcData: any;
  constructor(private flowService: B2bFlowService) {
    this.nodeList = [];
    this.data = {};
    this.dataChange = new EventEmitter();
    this.globalType = 'object';
    this.triggerAddChild = new EventEmitter();
  }

  ngOnInit(): void {
    if (!this.data) {
      this.data = {};
    }

    this.rcData = this.nodeList.map(ele => {
      return {
        name: ele.name || ele._id,
        value: ele._id,
        ref: this.userSelectedValue(`{{node['${ele._id}'].body}}`)
      }
    })

    console.log(this.rcData);
  }

  onDataChange(data: any) {
    console.log('onDataChange', data);
    this.data = data;
    this.dataChange.emit(this.data);
  }

  addFromRoot() {
    this.triggerAddChild.emit();
  }

  userSelectedValue(data) {
    if (data && typeof data == 'string') {
      let configuredData = this.flowService.parseDynamicValue(data);
      return this.flowService.getDynamicName(configuredData, this.nodeList);
    }
    return null;
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
