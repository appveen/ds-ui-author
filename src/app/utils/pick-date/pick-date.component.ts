import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'odp-pick-date',
  templateUrl: './pick-date.component.html',
  styleUrls: ['./pick-date.component.scss']
})
export class PickDateComponent implements OnInit {

  @Input() hasStep: boolean;
  @Input() disabled: boolean;
  @Input() month: any;
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
      ['1', '2', '3', '4', '5'],
      ['6', '7', '8', '9', '10', '11', '12'],
      ['13', '14', '15', '16', '17', '18', '19'],
      ['20', '21', '22', '23', '24', '25', '26'],
      ['27', '28', '29', '30', '31']
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
