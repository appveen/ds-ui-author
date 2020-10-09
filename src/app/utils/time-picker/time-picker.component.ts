import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'odp-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {

  @Input() toggle: boolean;
  @Output() toggleChange: EventEmitter<boolean>;
  @Input() value: {
    from?: string;
    to?: string;
  };
  @Output() valueChange: EventEmitter<{
    from?: string;
    to?: string;
  }>;
  oldVal: {
    from?: string;
    to?: string;
  };
  fromHour: number;
  fromMinute: number;
  toHour: number;
  toMinute: number;
  constructor() {
    const self = this;
    self.toggleChange = new EventEmitter();
    self.valueChange = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
    if (!self.value) {
      self.value = {};
    }
    if (!self.value.from) {
      self.value.from = '00:00';
    }
    if (!self.value.to) {
      self.value.to = '23:59';
    }
    self.oldVal = self.value;
    this.parseValue();
  }

  parseValue() {
    const fromTime = this.value.from.split(':');
    const toTime = this.value.to.split(':');
    this.fromHour = parseInt(fromTime[0], 10);
    this.fromMinute = parseInt(fromTime[1], 10);
    this.toHour = parseInt(toTime[0], 10);
    this.toMinute = parseInt(toTime[1], 10);
  }

  done() {
    const self = this;
    self.toggle = false;
    self.value.from = _.padStart(self.fromHour, 2, '0') + ':' + _.padStart(self.fromMinute, 2, '0');
    self.value.to = _.padStart(self.toHour, 2, '0') + ':' + _.padStart(self.toMinute, 2, '0');
    self.valueChange.emit(self.value);
    self.toggleChange.emit(self.toggle);
  }

  reset() {
    const self = this;
    self.value = self.oldVal;
    this.parseValue();
  }

  changeHour(type: string, val: number) {
    const self = this;
    if (val < 0) {
      val = 0;
    }
    if (val >= 23) {
      val = 23;
    }
    setTimeout(() => {
      if (type === 'from') {
        self.fromHour = val;
      } else {
        self.toHour = val;
      }
    }, 200);
  }

  changeMinute(type: string, val: number) {
    const self = this;
    if (val < 0) {
      val = 0;
    }
    if (val > 59) {
      val = 59;
    }
    setTimeout(() => {
      if (type === 'from') {
        self.fromMinute = val;
      } else {
        self.toMinute = val;
      }
    }, 200);
  }

  get isInvalid() {
    const from = new Date();
    from.setHours(this.fromHour, this.fromMinute, 0, 0);
    const to = new Date();
    to.setHours(this.toHour, this.toMinute, 0, 0);
    if (from.getTime() > to.getTime()) {
      to.setDate(to.getDate() + 1);
    }
    to.setSeconds(-(15 * 60));
    if (from.getTime() > to.getTime()) {
      return true;
    }
    return false;
  }
}
