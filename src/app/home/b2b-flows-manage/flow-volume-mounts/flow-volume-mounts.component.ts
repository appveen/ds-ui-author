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
  selectedIndex: number;
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

  addVolumeMount() {
    this.toggleVariableForm = true;
    this.form = {
      mountType: 'HOSTPATH'
    };
  }

  editVolumeMount(index: number) {
    this.selectedIndex = index;
    this.form = this.appService.cloneObject(this.volumeMounts[index]);
    if (!this.form.mountType) {
      this.form.mountType = 'HOSTPATH';
    }
    this.toggleVariableForm = true;
  }

  deleteVolumeMount(index: number) {
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

  onKeyBlur() {
    if (this.form.name) {
      this.form.name = _.toLower(_.kebabCase(this.form.name));
    }
  }

  get volumeMounts() {
    return this.data.volumeMounts;
  }

  set volumeMounts(val: any) {
    this.data.volumeMounts = val;
  }

  get nameError() {
    if (this.form && this.form.name) {
      let tempIndex = this.volumeMounts.findIndex(e => e.name == this.form.name);
      if (this.selectedIndex > -1 && tempIndex > -1 && tempIndex != this.selectedIndex) {
        return true;
      } else if (this.selectedIndex == -1 && tempIndex > -1) {
        return true;
      }
    }
    return false;
  }
}
