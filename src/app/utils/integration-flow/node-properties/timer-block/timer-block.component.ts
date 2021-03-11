import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { IntegrationFlowService } from '../../integration-flow.service';
import { EditConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { ActivateProperties, FlowData, NodeData } from '../../integration-flow.model';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-timer-block',
  templateUrl: './timer-block.component.html',
  styleUrls: ['./timer-block.component.scss']
})
export class TimerBlockComponent implements OnInit {

  @ViewChild('pickerModal', { static: true }) pickerModal: TemplateRef<HTMLElement>;
  @Input() edit: EditConfig;
  @Input() nodeList: Array<NodeData>;
  @Input() flowData: FlowData;
  allDay: boolean;
  togglePickerStartDate: boolean;
  togglePickerEndDate: boolean;
  showRepeatOptions: boolean;
  boundList: Array<any>;
  pickerModalRef: NgbModalRef;
  selectedBoundItem: any;
  boundTypes: Array<string>;
  repeatType: string;
  repeatAll: string;
  repeatStep: string;
  repeatStepValue: any;
  constructor(private flowService: IntegrationFlowService,
    private commonService: CommonService) {
    const self = this;
    self.edit = {
      status: false
    };
    self.flowData = {
      timer: {
        enabled: false
      }
    };
    self.nodeList = [];
    self.boundList = [];
    self.boundTypes = ['minute', 'hour', 'date', 'month', 'week'];
  }

  ngOnInit() {
    const self = this;
  
    self.flowData.timer.enabled = true;
    if (self.flowData.timer.cronRegEx) {
      const values = self.flowData.timer.cronRegEx.split(' ');
      if (values.indexOf('*') > -1) {
        self.repeatType = 'every';
      }
      values.forEach((val, i) => {
        if (val !== '*') {
          const segments = val.split('/');
          let value = val;
          if (segments.length > 1) {
            value = segments[0];
            self.repeatStep = self.boundTypes[i];
            self.repeatStepValue = parseInt(segments[1], 10);
          }
          if (value !== '*') {
            self.boundList.push({
              type: self.boundTypes[i],
              value
            });
          }
        }
      });
    }
  }

  setRepeat(value: string) {
    const self = this;
    self.showRepeatOptions = false;
    // self.flowData.timer.repeat = value;
  }

  addBound(type: string) {
    const self = this;
    self.showRepeatOptions = false;
    self.boundList.push({
      type,
      values: ''
    });
  }

  removeBound(index: number) {
    const self = this;
    self.boundList.splice(index, 1);
  }

  openPicker(item: any) {
    const self = this;
    self.selectedBoundItem = item;
  }

  closePicker() {
    const self = this;
    self.selectedBoundItem = null;
    self.buildCronRegEx();
  }

  buildCronRegEx() {
    const self = this;
    const crontab = self.boundTypes.map((e, i) => {
      const temp = self.boundList.find(b => b.type === e);
      if (temp) {
        return temp.value;
      }
      return 0;
    });
   
  }

  showBoundValues(item: any) {
    const self = this;
    if (!item.value) {
      item.value = '';
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (item.type === 'month') {
      return item.value.split(',').map(e => months[e - 1]).join(', ');
    } else if (item.type === 'week') {
      return item.value.split(',').map(e => weeks[e]).join(', ');
    } else {
      return item.value.split(',').join(', ');
    }
  }

  showOption(type: string) {
    const self = this;
    if (self.repeatType === 'every' && self.repeatAll === type) {
      return false;
    }
    if (self.boundList.find(e => e.type === type)) {
      return false;
    }
    return true;
  }

  hasStep() {
    const self = this;
    if (self.selectedBoundItem && self.repeatType === 'once' && self.selectedBoundItem.type === self.repeatStep) {
      return true;
    }
    return false;
  }


  get enableTimer() {
    const self = this;
    if (self.flowData && self.flowData.timer && self.flowData.timer.enabled) {
      return true;
    }
    return false;
  }

  set enableTimer(value) {
    const self = this;
    if (self.flowData && self.flowData.timer) {
      self.flowData.timer.enabled = value;
    }
  }
}
