import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'odp-pick-month',
  templateUrl: './pick-month.component.html',
  styleUrls: ['./pick-month.component.scss']
})
export class PickMonthComponent implements OnInit {

  @Input() hasStep: boolean;
  @Input() disabled: boolean;
  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;
  @Output() done: EventEmitter<any>;
  items: Array<any>;
  constructor() {
    const self = this;
    self.items = [];
    self.valueChange = new EventEmitter();
    self.done = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
    if (self.value) {
      if (self.value.indexOf('-') > -1) {
        self.items = self.value.split('-');
      } else {
        self.items = self.value.split(',');
      }
    }
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
    self.items = self.items.map(e => parseInt(e, 10)).sort((a, b) => a - b).map(e => e + '');
    if (self.hasStep) {
      self.value = self.items.join('-');
    } else {
      self.value = self.items.join(',');
    }
    if (self.items.length === 0) {
      self.value = '*';
    }
    self.valueChange.emit(self.value);
  }

  onDone() {
    const self = this;
    self.valueChange.emit(self.value);
    self.done.emit();
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
