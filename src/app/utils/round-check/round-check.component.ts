import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as uuid from 'uuid/v1';
@Component({
  selector: 'odp-round-check',
  templateUrl: './round-check.component.html',
  styleUrls: ['./round-check.component.scss']
})
export class RoundCheckComponent {

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
    if (!self.edit.status) {
      return;
    }
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
}
