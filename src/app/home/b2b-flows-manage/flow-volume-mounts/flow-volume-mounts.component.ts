import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { B2bFlowService } from '../b2b-flow.service';
@Component({
  selector: 'odp-flow-volume-mounts',
  templateUrl: './flow-volume-mounts.component.html',
  styleUrls: ['./flow-volume-mounts.component.scss']
})
export class FlowVolumeMountsComponent implements OnInit {

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
    if (!this.data.volumeMounts) {
      this.data.volumeMounts = [];
    }
  }

  addConstant() {
    this.toggleVariableForm = true;
    this.form = {};
  }

  editConstant(index: number) {
    this.selectedIndex = index;
    this.form = this.appService.cloneObject(this.volumeMounts[index]);
    this.toggleVariableForm = true;
  }

  deleteConstant(index: number) {
    this.volumeMounts.splice(index, 1)
  }

  saveData() {
    let newData = this.appService.cloneObject(this.form);
    if (this.selectedIndex > -1) {
      this.volumeMounts.splice(this.selectedIndex, 1, newData)
    } else {
      this.volumeMounts.push(newData);
    }
    this.cancel();
  }

  cancel() {
    this.selectedIndex = -1;
    this.toggleVariableForm = false;
  }

  get volumeMounts() {
    return this.data.volumeMounts;
  }

  set volumeMounts(val: any) {
    this.data.volumeMounts = val;
  }
}
