import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as uuid from 'uuid/v1';

@Component({
  selector: 'odp-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {

  @Input() id: string;
  @Input() class: string;
  @Input() disabled: boolean;
  @Input() edit: any;
  @Input() checked: boolean;
  @Output() checkedChange: EventEmitter<boolean>;
  constructor() {
    const self = this;
    self.checkedChange = new EventEmitter();
    self.edit = {
      status: false
    };
    self.id = uuid();
  }

  ngOnInit() {
    const self = this;

  }

  onChange(value) {
    const self = this;
    self.checked = value;
    self.checkedChange.emit(value);
  }

}
