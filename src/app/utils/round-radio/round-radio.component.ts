import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as uuid from 'uuid/v1';

@Component({
  selector: 'odp-round-radio',
  templateUrl: './round-radio.component.html',
  styleUrls: ['./round-radio.component.scss']
})
export class RoundRadioComponent {

  @Input() id: string;
  @Input() size: number;
  @Input() edit: any;
  @Input() checked: boolean;
  @Output() checkedChange: EventEmitter<boolean>;
  constructor() {
    const self = this;
    self.checkedChange = new EventEmitter();
    self.size = 16;
    self.id = uuid();
    self.edit = {};
  }

  toggle(val) {
    const self = this;
    self.checked = val;
    self.checkedChange.emit(val);
  }

  get style() {
    const self = this;
    return {
      'min-width': self.size + 'px',
      'max-width': self.size + 'px',
      'min-height': self.size + 'px',
      'max-height': self.size + 'px'
    };
  }

  get styleInner() {
    const self = this;
    return {
      'min-width': self.size / 2.5 + 'px',
      'max-width': self.size / 2.5 + 'px',
      'min-height': self.size / 2.5 + 'px',
      'max-height': self.size / 2.5 + 'px'
    };
  }

}
