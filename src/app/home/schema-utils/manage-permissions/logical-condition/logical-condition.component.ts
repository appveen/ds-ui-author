import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'odp-logical-condition',
  templateUrl: './logical-condition.component.html',
  styleUrls: ['./logical-condition.component.scss']
})
export class LogicalConditionComponent implements OnInit {

  @Input() edit: {
    id: string;
    status: boolean;
  };
  @Input() field: any;
  @Input() condition: any;
  @Output() conditionChange: EventEmitter<any>;
  optionsDropDown: boolean;
  constructor() {
    const self = this;
    self.conditionChange = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
  }

  onChange(condition: string) {
    const self = this;
    self.optionsDropDown = false;
    self.condition.condition = condition;
    self.conditionChange.emit(self.condition);
  }

  showOperator(operator) {
    const self = this;
    if (self.field && (self.field.type === 'Number' || self.field.type === 'Date')) {
      return true;
    }
    return false;
  }
}
