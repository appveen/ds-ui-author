import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { fromEvent } from 'rxjs';
import { flatMap, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'odp-slider-week',
  templateUrl: './slider-week.component.html',
  styleUrls: ['./slider-week.component.scss']
})
export class SliderWeekComponent implements OnInit {

  @Input() toggle: boolean;
  @Output() toggleChange: EventEmitter<boolean>;
  @Input() value: Array<string | number> | string;
  @Output() valueChange: EventEmitter<string>;
  oldVal: string;
  weeks: Array<{
    label?: string;
    value?: number;
  }>;
  searchTermFrom: string;
  searchTermTo: string;
  stepDistance: number;
  constructor() {
    const self = this;
    self.toggleChange = new EventEmitter();
    self.valueChange = new EventEmitter();
    self.weeks = [
      { label: 'SUN', value: 0 },
      { label: 'MON', value: 1 },
      { label: 'TUE', value: 2 },
      { label: 'WED', value: 3 },
      { label: 'THU', value: 4 },
      { label: 'FRI', value: 5 },
      { label: 'SAT', value: 6 },
    ];
    self.stepDistance = 226 / 6;
  }

  ngOnInit() {
    const self = this;
    self.oldVal = self.value as string;
    self.reset();
   
  }

  done() {
    const self = this;
    self.toggle = false;
    self.valueChange.emit((self.value as Array<number>).join(','));
    self.toggleChange.emit(self.toggle);
  }

  reset() {
    const self = this;
    if (!self.oldVal || self.oldVal === '*') {
      self.value = self.weeks.map(e => e.value);
    } else if (self.oldVal.match(/[0-9]{1}-[0-9]{1}/)) {
      let lower = parseInt(self.oldVal.split('-')[0], 10);
      let upper = parseInt(self.oldVal.split('-')[1], 10);
      self.value = [];
      if (lower > upper) {
        const temp = lower;
        lower = upper;
        upper = temp;
      }
      for (let index = lower; index <= upper; index++) {
        self.value.push(index);
      }
    } else {
      self.value = self.oldVal.split(',').map(e => parseInt(e, 10));
    }
  }

 

  toggleSelect(val: number) {
    const self = this;
    const index = (self.value as Array<number>).indexOf(val);
    if (index > -1) {
      (self.value as Array<number>).splice(index, 1);
    } else {
      (self.value as Array<number>).push(val);
    }
    (self.value as Array<number>).sort();
  }

  isSelected(val: number) {
    const self = this;
    if (!self.value) {
      return false;
    }
    return (self.value as Array<number>).indexOf(val) > -1;
  }

}
