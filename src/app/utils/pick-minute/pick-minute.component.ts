import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'odp-pick-minute',
  templateUrl: './pick-minute.component.html',
  styleUrls: ['./pick-minute.component.scss']
})
export class PickMinuteComponent implements OnInit {

  @Input() hasStep: boolean;
  @Input() disabled: boolean;
  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;
  @Output() done: EventEmitter<any>;
  table: Array<Array<any>>;
  customValue: any;
  items: Array<any>;
  constructor() {
    const self = this;
    self.valueChange = new EventEmitter();
    self.done = new EventEmitter();
    self.items = [];
    self.table = [
      ['00', '05', '10', '15', '20', '25'],
      ['30', '35', '40', '45', '50', '55'],
    ];
  }

  ngOnInit() {
    const self = this;
    if (self.value) {
      self.items = self.value.split(',');
    }
  }

  addCustom() {
    const self = this;
    if (self.customValueInvalid || typeof self.customValue !== 'number') {
      return;
    }
    const index = self.items.indexOf(self.customValue);
    if (index > -1) {
      return;
    }
    self.items.push(self.customValue);
    self.value = self.items.join(',');
    self.valueChange.emit(self.value);
  }

  isSelected(value) {
    const self = this;
    if (self.value && self.items.indexOf(value) > -1) {
      return true;
    }
    return false;
  }

  onClick(value) {
    const self = this;
    const index = self.items.indexOf(value);
    if (index > -1) {
      self.items.splice(index, 1);
    } else {
      self.items.push(value);
    }
    self.value = self.items.join(',');
    self.valueChange.emit(self.value);
  }

  onDone() {
    const self = this;
    self.done.emit();
  }

  get customValueInvalid() {
    const self = this;
    if (typeof self.customValue === 'number' && (self.customValue < 0 || self.customValue > 59)) {
      return true;
    } else {
      return false;
    }
  }

  get isInvalid() {
    const self = this;
    if (self.disabled) {
      return true;
    }
    if (self.items.length === 0) {
      return true;
    }
    return false;
  }

}
