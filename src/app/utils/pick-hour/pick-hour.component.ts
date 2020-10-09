import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'odp-pick-hour',
  templateUrl: './pick-hour.component.html',
  styleUrls: ['./pick-hour.component.scss']
})
export class PickHourComponent implements OnInit {

  @Input() hasStep: boolean;
  @Input() disabled: boolean;
  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;
  @Output() done: EventEmitter<any>;
  table: Array<Array<any>>;
  items: Array<any>;
  mouseOverItem: string;
  constructor() {
    const self = this;
    self.valueChange = new EventEmitter();
    self.done = new EventEmitter();
    self.items = [];
    self.table = [
      ['00', '01', '02', '03', '04', '05'],
      ['06', '07', '08', '9', '10', '11'],
      ['12', '13', '14', '15', '16', '17'],
      ['18', '19', '20', '21', '22', '23'],
    ];
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

  isMouseOver(value) {
    const self = this;
    if (self.items.length === 1
      && parseInt(self.items[0], 10) < parseInt(value, 10)
      && parseInt(value, 10) <= parseInt(self.mouseOverItem, 10)) {
      return true;
    }
    return false;
  }

  inRange(value) {
    const self = this;
    if (self.items.length === 2
      && parseInt(self.items[0], 10) < parseInt(value, 10)
      && parseInt(value, 10) <= parseInt(self.items[1], 10)) {
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
      if (self.hasStep && self.items.length > 0) {
        if (self.items.length === 2) {
          return;
        }
        if (parseInt(self.items[0], 10) < parseInt(value, 10)) {
          self.items.push(value);
        }
      } else {
        self.items.push(value);
      }
    }
    if (self.hasStep) {
      self.value = self.items.join('-');
    } else {
      self.value = self.items.join(',');
    }
  }

  onClear() {
    const self = this;
    self.items.splice(0);
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
    if (self.hasStep && self.items.length !== 2) {
      return true;
    }
    return false;
  }

}
