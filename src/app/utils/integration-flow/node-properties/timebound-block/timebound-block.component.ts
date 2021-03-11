import { Component, OnInit, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IntegrationFlowService } from '../../integration-flow.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { EditConfig, NodeData, FlowData } from '../../integration-flow.model';

@Component({
  selector: 'odp-timebound-block',
  templateUrl: './timebound-block.component.html',
  styleUrls: ['./timebound-block.component.scss']
})
export class TimeboundBlockComponent implements OnInit {

  @Input() edit: EditConfig;
  @Input() index: number;
  @Input() node: NodeData;
  @Input() nodeList: Array<NodeData>;
  @Input() flowData: FlowData;
  togglePickerFrom: boolean;
  togglePickerTo: boolean;
  showSlider: string;
  enableCalendars: boolean;
  calendarList: Array<string>;
  constructor(private flowService: IntegrationFlowService,
    private commonService: CommonService,
    private datePipe: DatePipe) {
    const self = this;
    self.edit = {
      status: false
    };
    self.flowData = {
      timer: {
        timebounds: [],
        restrictedZoneAction: 'queue',
        enabled: false,
        cronRegEx: '* * * * *'
      }
    };
    self.nodeList = [];
    this.calendarList = [];
  }

  ngOnInit() {
    const self = this;
    self.fixData();
    this.getCalendars();
  }

  getCalendars() {
    this.commonService.get('serviceManager', '/service', {
      filter: { name: `${this.commonService.app._id} Calendar`, app: this.commonService.app._id, status: 'Active' },
      count: 1,
      select: 'definition'
    }).subscribe((res: Array<any>) => {
      if (res && res.length > 0) {
        this.enableCalendars = true;
        try {
          this.calendarList = res[0].definition.find(e => e.key === 'name').properties.enum || [];
        } catch (e) {
          this.calendarList = [];
        }
      } else {
        this.enableCalendars = false;
        this.flowData.timer.greenZone = [];
        this.flowData.timer.redZone = [];
      }
    }, err => {
      this.enableCalendars = false;
    });
  }

  fixData() {
    const self = this;
    if (!self.flowData) {
      self.flowData = {};
    }
    if (!self.flowData.timer) {
      self.flowData.timer = {};
    }
    if (!self.flowData.timer.cronRegEx) {
      self.flowData.timer.cronRegEx = '* * * * *';
    }
    if (!self.flowData.timer.restrictedZoneAction) {
      self.flowData.timer.restrictedZoneAction = 'queue';
      if (self.commonService.userDetails.b2BFlowRejectZoneAction) {
        self.flowData.timer.restrictedZoneAction = (self.commonService.userDetails.b2BFlowRejectZoneAction || 'queue');
      }
    }
    if (!self.flowData.timer.timebounds) {
      self.flowData.timer.timebounds = [];
    }
    if (self.flowData.timer.timebounds.length === 0) {
      self.flowData.timer.timebounds.push({
        from: '00:00',
        to: '23:59'
      });
    }
  }

  getValue(segment: number) {
    const self = this;
    let segments = self.flowData.timer.cronRegEx.split(' ');
    segments = segments.filter(e => e);
    while (segments.length < 5) {
      segments.unshift('*');
    }
    return segments[segment];
  }

  setValue(value: string, segment: number) {
    const self = this;
    let segments = self.flowData.timer.cronRegEx.split(' ');
    segments = segments.filter(e => e);
    while (segments.length < 5) {
      segments.unshift('*');
    }
    segments.splice(segment, 1, value);
    self.flowData.timer.cronRegEx = segments.join(' ');
  }

  openSlider(event: MouseEvent, value: string) {
    const self = this;
    if (!self.edit.status) {
      return;
    }
    event.stopPropagation();
    self.showSlider = value;
  }

  onGreeZoneChange(event) {
    const target: HTMLInputElement = event.target;
    if (!this.flowData.timer.greenZone) {
      this.flowData.timer.greenZone = [];
    }
    const index = this.flowData.timer.greenZone.findIndex(e => e === target.value);
    if (index === -1 && target.value) {
      this.flowData.timer.greenZone.push(target.value);
    }
    setTimeout(() => {
      target.value = '';
    }, 200);
  }

  removeGreenZone(index) {
    if (this.flowData.timer.greenZone) {
      this.flowData.timer.greenZone.splice(index, 1);
    }
  }

  onRedZoneChange(event) {
    const target: HTMLInputElement = event.target;
    if (!this.flowData.timer.redZone) {
      this.flowData.timer.redZone = [];
    }
    const index = this.flowData.timer.redZone.findIndex(e => e === target.value);
    if (index === -1 && target.value) {
      this.flowData.timer.redZone.push(target.value);
    }
    setTimeout(() => {
      target.value = '';
    }, 200);
  }

  removeRedZone(index) {
    if (this.flowData.timer.redZone) {
      this.flowData.timer.redZone.splice(index, 1);
    }
  }

  onTimeboundToggle(event) {
    this.fixData();
  }


  get selectedHours() {
    const self = this;
    self.fixData();
    return self.flowData.timer.timebounds[0];
  }
  set selectedHours(val) {
    const self = this;
    self.fixData();
    const len = self.flowData.timer.timebounds.length;
    self.flowData.timer.timebounds.splice(0, len, val);
  }

  get monthsInText() {
    const self = this;
    const val = self.getValue(3);
    if (val && val !== '*' && val.match(/[0-9]{1,2}-[0-9]{1,2}/)) {
      const fromVal = parseInt(val.split('-')[0], 10) - 1;
      const toVal = parseInt(val.split('-')[1], 10) - 1;
      return self.flowService.getMonth(fromVal) + ' to ' + self.flowService.getMonth(toVal);
    }
    return 'Jan to Dec';
  }

  get datesInText() {
    const self = this;
    const val = self.getValue(2);
    if (val && val !== '*') {
      return val.split('-').join(' to ');
    }
    return '1 to 31';
  }

  get weeksInText() {
    const self = this;
    const val = self.getValue(4);
    if (!val || val === '*') {
      return 'Sun to Sat';
    } else if (val.match(/[0-9]{1}-[0-9]{1}/)) {
      const fromVal = parseInt(val.split('-')[0], 10);
      const toVal = parseInt(val.split('-')[1], 10);
      return self.flowService.getWeek(fromVal) + ' to ' + self.flowService.getWeek(toVal);
    } else {
      const flag = val.split(',').map((e, i) => parseInt(e, 10) === i).reduce((p, c) => p && c, true);
      if (flag) {
        const seg = val.split(',');
        return self.flowService.getWeek(seg[0]) + ' - ' + self.flowService.getWeek(seg[seg.length - 1]);
      } else {
        return val.split(',').map(e => self.flowService.getWeek(e)).join(', ');
      }
    }
  }

  get hoursInText() {
    const self = this;
    if (self.flowData.timer.timebounds && self.flowData.timer.timebounds.length > 0) {
      const val = self.flowData.timer.timebounds[0];
      return val.from + ' to ' + val.to;
    }
    return '00:00 to 23:59';
  }

  get showBlock() {
    const self = this;
    if (self.node && self.node.meta.blockType === 'INPUT' && self.node.meta.sourceType === 'FILE') {
      return true;
    }
    return false;
  }

  set startDate(val) {
    if (this.flowData && this.flowData.timer) {
      if (val) {
        this.flowData.timer.startDate = new Date(val).toISOString();
      } else {
        this.flowData.timer.startDate = null;
      }
    }
  }

  get startDate() {
    if (this.flowData && this.flowData.timer && this.flowData.timer.startDate) {
      return this.datePipe.transform(this.flowData.timer.startDate, 'yyyy-MM-ddTHH:mm');
    }
    return '';
  }

  set endDate(val) {
    if (this.flowData && this.flowData.timer) {
      if (val) {
        this.flowData.timer.endDate = new Date(val).toISOString();
      } else {
        this.flowData.timer.endDate = null;
      }
    }
  }

  get endDate() {
    if (this.flowData && this.flowData.timer && this.flowData.timer.endDate) {
      return this.datePipe.transform(this.flowData.timer.endDate, 'yyyy-MM-ddTHH:mm');
    }
    return '';
  }

  get isInvalidStartEndDate() {
    if (this.flowData && this.flowData.timer && this.flowData.timer.startDate && this.flowData.timer.endDate) {
      const startDate = new Date(this.flowData.timer.startDate);
      const endDate = new Date(this.flowData.timer.endDate);
      if (startDate.getTime() >= endDate.getTime()) {
        return true;
      }
    }
    return false;
  }

}
