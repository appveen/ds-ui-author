import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { B2bFlowService } from '../b2b-flow.service';

@Component({
  selector: 'odp-flow-contants',
  templateUrl: './flow-contants.component.html',
  styleUrls: ['./flow-contants.component.scss']
})
export class FlowContantsComponent implements OnInit {

  @Input() data: any;
  @Input() nodeList: any;

  toggleVariableForm: boolean;
  form: any;
  selectedIndex: number
  constructor(private commonService: CommonService,
    private appService: AppService,
    private flowService: B2bFlowService) {
    this.selectedIndex = -1;
  }

  ngOnInit(): void {
    if (!this.data.constants) {
      this.data.constants = [];
    }
  }

  addConstant() {
    this.toggleVariableForm = true;
    this.form = { dataType: 'String' };
  }

  editConstant(index: number) {
    this.selectedIndex = index;
    this.form = this.appService.cloneObject(this.constantList[index]);
    this.toggleVariableForm = true;
  }

  deleteConstant(index: number) {
    this.constantList.splice(index, 1)
  }

  saveData() {
    let newData = this.appService.cloneObject(this.form);
    if (this.selectedIndex > -1) {
      this.constantList.splice(this.selectedIndex, 1, newData)
    } else {
      this.constantList.push(newData);
    }
    this.cancel();
  }

  cancel() {
    this.selectedIndex = -1;
    this.toggleVariableForm = false;
  }

  onKeyBlur() {
    if (this.form.key) {
      this.form.key = _.toUpper(_.snakeCase(this.form.key));
    }
  }

  get constantList() {
    return this.data.constants;
  }

  set constantList(val: any) {
    this.data.constants = val;
  }
}
